from app.items.application.dtos.item_dto import ItemCreateDTO, ItemDTO, ItemUpdateDTO
from app.items.domain.entities.item import Item
from app.items.domain.interfaces.item_repository import ItemRepository


class GetItemUseCase:
    """Use case to retrieve a specific item"""

    def __init__(self, repository: ItemRepository):
        self.repository = repository

    async def execute(self, item_id: int) -> ItemDTO | None:
        """Get an item by ID"""
        item = await self.repository.get_by_id(item_id)
        if item is None:
            return None
        return ItemDTO.model_validate(item)


class GetAllItemsUseCase:
    """Use case to retrieve all items"""

    def __init__(self, repository: ItemRepository):
        self.repository = repository

    async def execute(self, skip: int = 0, limit: int = 100) -> list[ItemDTO]:
        """Get all items with pagination"""
        items = await self.repository.get_all(skip=skip, limit=limit)
        return [ItemDTO.model_validate(item) for item in items]


class CreateItemUseCase:
    """Use case to create a new item"""

    def __init__(self, repository: ItemRepository):
        self.repository = repository

    async def execute(self, dto: ItemCreateDTO) -> ItemDTO:
        """Create a new item"""
        item = Item(name=dto.name, description=dto.description, due_date=dto.due_date)
        created_item = await self.repository.create(item, tag_ids=dto.tag_ids)
        return ItemDTO.model_validate(created_item)


class UpdateItemUseCase:
    """Use case to update an existing item"""

    def __init__(self, repository: ItemRepository):
        self.repository = repository

    async def execute(self, item_id: int, dto: ItemUpdateDTO) -> ItemDTO | None:
        """Update an existing item"""
        # Get the current item
        current_item = await self.repository.get_by_id(item_id)
        if current_item is None:
            return None

        # Update fields if provided
        if dto.name is not None:
            current_item.name = dto.name
        if dto.description is not None:
            current_item.description = dto.description
        if "due_date" in dto.model_fields_set:
            current_item.due_date = dto.due_date

        updated_item = await self.repository.update(item_id, current_item, tag_ids=dto.tag_ids)
        return ItemDTO.model_validate(updated_item)


class DeleteItemUseCase:
    """Use case to delete an item"""

    def __init__(self, repository: ItemRepository):
        self.repository = repository

    async def execute(self, item_id: int) -> bool:
        """Delete an item"""
        return await self.repository.delete(item_id)
