"""Fixtures for items application tests"""

from datetime import datetime

from app.items.application.dtos.item_dto import ItemCreateDTO, ItemDTO, ItemUpdateDTO
from app.items.domain.entities.item import Item


def create_item_entity(
    id: int = 1,
    name: str = "Test Item",
    description: str = "Test Description",
    created_at: datetime | None = None,
    updated_at: datetime | None = None,
    due_date: datetime | None = None,
) -> Item:
    """Create a test Item entity"""
    return Item(
        id=id,
        name=name,
        description=description,
        created_at=created_at or datetime(2024, 1, 1, 12, 0, 0),
        updated_at=updated_at,
        due_date=due_date,
    )


def create_item_dto(
    id: int = 1,
    name: str = "Test Item",
    description: str = "Test Description",
    created_at: datetime | None = None,
    updated_at: datetime | None = None,
    due_date: datetime | None = None,
) -> ItemDTO:
    """Create a test ItemDTO"""
    return ItemDTO(
        id=id,
        name=name,
        description=description,
        created_at=created_at or datetime(2024, 1, 1, 12, 0, 0),
        updated_at=updated_at,
        due_date=due_date,
        tags=[],
    )


def create_item_create_dto(
    name: str = "Test Item",
    description: str = "Test Description",
    tag_ids: list[int] | None = None,
    due_date: datetime | None = None,
) -> ItemCreateDTO:
    """Create a test ItemCreateDTO"""
    return ItemCreateDTO(
        name=name,
        description=description,
        tag_ids=tag_ids or [],
        due_date=due_date,
    )


def create_item_update_dto(
    name: str | None = "Updated Item",
    description: str | None = "Updated Description",
    tag_ids: list[int] | None = None,
    due_date: datetime | None = None,
) -> ItemUpdateDTO:
    """Create a test ItemUpdateDTO"""
    return ItemUpdateDTO(
        name=name,
        description=description,
        tag_ids=tag_ids,
        due_date=due_date,
    )
