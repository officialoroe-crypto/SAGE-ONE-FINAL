"""Phone verification abstraction.

This module owns the verification state machine. A real SMS adapter can be
plugged into `OTPProvider.send`; OTP codes are never persisted in the user
profile or returned by the HTTP API.
"""

from __future__ import annotations

import hashlib
import hmac
import secrets
import time
from dataclasses import dataclass
from typing import Protocol


class OTPProvider(Protocol):
    def send(self, phone: str, code: str) -> None: ...


@dataclass(frozen=True)
class OTPChallenge:
    challenge_id: str
    owner_key: str
    phone: str
    code_hash: str
    expires_at: float
    attempts_remaining: int


class OTPManager:
    def __init__(self, provider: OTPProvider | None = None, ttl_seconds: int = 300, max_attempts: int = 5):
        self.provider = provider
        self.ttl_seconds = ttl_seconds
        self.max_attempts = max_attempts
        self._challenges: dict[str, OTPChallenge] = {}
        self._attempts: dict[str, int] = {}

    @staticmethod
    def _hash(code: str) -> str:
        return hashlib.sha256(code.encode("utf-8")).hexdigest()

    def create_challenge(self, owner_key: str, phone: str) -> OTPChallenge:
        owner_key = owner_key.strip()
        phone = phone.strip()
        if not owner_key:
            raise ValueError("Challenge owner is required.")
        if not phone:
            raise ValueError("Phone number is required.")

        challenge_id = secrets.token_urlsafe(24)
        code = f"{secrets.randbelow(1_000_000):06d}"
        challenge = OTPChallenge(
            challenge_id=challenge_id,
            owner_key=owner_key,
            phone=phone,
            code_hash=self._hash(code),
            expires_at=time.time() + self.ttl_seconds,
            attempts_remaining=self.max_attempts,
        )
        self._challenges[challenge_id] = challenge
        self._attempts[challenge_id] = 0

        if self.provider is not None:
            self.provider.send(phone, code)

        return challenge

    def verify(self, owner_key: str, challenge_id: str, code: str) -> bool:
        challenge = self._challenges.get(challenge_id)
        if challenge is None or not hmac.compare_digest(challenge.owner_key, owner_key):
            return False
        if time.time() >= challenge.expires_at:
            self._challenges.pop(challenge_id, None)
            self._attempts.pop(challenge_id, None)
            return False

        attempts = self._attempts.get(challenge_id, 0)
        if attempts >= self.max_attempts:
            return False
        self._attempts[challenge_id] = attempts + 1

        valid = hmac.compare_digest(challenge.code_hash, self._hash(code.strip()))
        if valid:
            self._challenges.pop(challenge_id, None)
            self._attempts.pop(challenge_id, None)
        return valid

    def challenge_phone(self, owner_key: str, challenge_id: str) -> str | None:
        challenge = self._challenges.get(challenge_id)
        if challenge is None or not hmac.compare_digest(challenge.owner_key, owner_key):
            return None
        if time.time() >= challenge.expires_at:
            return None
        return challenge.phone


otp_manager = OTPManager()
