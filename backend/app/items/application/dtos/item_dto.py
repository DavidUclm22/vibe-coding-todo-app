from datetime import datetime

from pydantic import BaseModel, ConfigDict


class TagInItemDTO(BaseModel):
    """Simplified Tag DTO for inclusion in Item responses"""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    color: str


class ItemDTO(BaseModel):
    """DTO for Item responses"""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str | None = None
    due_date: datetime | None = None
    created_at: datetime
    updated_at: datetime | None = None
    tags: list[TagInItemDTO] = []


class ItemCreateDTO(BaseModel):
    """DTO for creating items"""

    name: str
    description: str | None = None
    due_date: datetime | None = None
    tag_ids: list[int] = []


class ItemUpdateDTO(BaseModel):
    """DTO for updating items"""

    name: str | None = None
    description: str | None = None
    due_date: datetime | None = None
    tag_ids: list[int] | None = None
