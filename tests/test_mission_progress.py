import uuid

from execution.progress import MissionProgress


def test_progress_events_are_ordered_and_normalized():
    # The durable event store survives across test runs, so a hardcoded mission
    # id would inherit old sequences (sequence is derived from persisted
    # history). A unique id keeps this deterministic while still exercising the
    # real persistence path.
    progress = MissionProgress(f"mission-{uuid.uuid4()}")

    first = progress.emit(
        "wave_started",
        "executing",
        "Starting wave.",
        wave=2,
        task_ids=["b", "a"],
        progress_percent=33.333,
    )
    second = progress.emit(
        "wave_completed",
        "executing",
        "Wave complete.",
        wave=2,
        task_ids=["a", "b"],
        progress_percent=66.666,
    )

    assert first["sequence"] == 1
    assert second["sequence"] == 2
    assert first["task_ids"] == ["a", "b"]
    assert first["progress_percent"] == 33.33
    assert second["progress_percent"] == 66.67
    assert progress.snapshot() == [first, second]
