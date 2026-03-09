from datetime import datetime


class Item:
    """Domain entity representing an Item"""

    def __init__(
        self,
        name: str,
        description: str | None = None,
        id: int | None = None,
        created_at: datetime | None = None,
        updated_at: datetime | None = None,
        due_date: datetime | None = None,
    ):
        self.id = id
        self.name = name
        self.description = description
        self.due_date = due_date
        self.created_at = created_at
        self.updated_at = updated_at
