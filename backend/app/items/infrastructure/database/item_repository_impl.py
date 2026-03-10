from sqlalchemy.orm import Session

from app.items.domain.entities.item import Item
from app.items.domain.interfaces.item_repository import ItemRepository
from app.items.infrastructure.orm.item_orm import ItemORM
from app.tags.infrastructure.orm.tag_orm import TagORM


class ItemRepositoryImpl(ItemRepository):
    """Implementation of ItemRepository using SQLAlchemy"""

    def __init__(self, db: Session):
        self.db = db

    async def get_by_id(self, item_id: int) -> ItemORM | None:
        """Get an item by ID - returns ORM for tags support"""
        orm_item = self.db.query(ItemORM).filter(ItemORM.id == item_id).first()
        return orm_item

    async def get_all(self, skip: int = 0, limit: int = 100) -> list[ItemORM]:
        """Get all items with pagination - returns ORM for tags support"""
        orm_items = self.db.query(ItemORM).offset(skip).limit(limit).all()
        return orm_items

    async def create(self, item: Item, tag_ids: list[int] | None = None) -> ItemORM:
        """Create a new item - returns ORM for tags support"""
        orm_item = ItemORM(
            name=item.name,
            description=item.description,
            due_date=item.due_date,
        )

        # Assign tags if provided
        if tag_ids:
            tags = self.db.query(TagORM).filter(TagORM.id.in_(tag_ids)).all()
            orm_item.tags = tags

        self.db.add(orm_item)
        self.db.commit()
        self.db.refresh(orm_item)
        return orm_item

    async def update(
        self, item_id: int, item: Item, tag_ids: list[int] | None = None
    ) -> ItemORM | None:
        """Update an existing item - returns ORM for tags support"""
        orm_item = self.db.query(ItemORM).filter(ItemORM.id == item_id).first()
        if orm_item is None:
            return None

        orm_item.name = item.name
        orm_item.description = item.description
        orm_item.due_date = item.due_date

        # Update tags if provided
        if tag_ids is not None:
            tags = self.db.query(TagORM).filter(TagORM.id.in_(tag_ids)).all()
            orm_item.tags = tags

        self.db.commit()
        self.db.refresh(orm_item)
        return orm_item

    async def delete(self, item_id: int) -> bool:
        """Delete an item"""
        orm_item = self.db.query(ItemORM).filter(ItemORM.id == item_id).first()
        if orm_item is None:
            return False

        self.db.delete(orm_item)
        self.db.commit()
        return True
