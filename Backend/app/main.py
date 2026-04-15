from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import databases
import sqlalchemy
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is missing!")

database = databases.Database(DATABASE_URL)
metadata = sqlalchemy.MetaData()

tree_table = sqlalchemy.Table(
    "tree_hierarchies",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True),
    sqlalchemy.Column("tree_data", sqlalchemy.JSON),
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TreeModel(BaseModel):
    tree_data: Dict[Any, Any]

class TreeResponse(TreeModel):
    id: int

@app.on_event("startup")
async def startup():
    engine = sqlalchemy.create_engine(DATABASE_URL)
    metadata.create_all(engine)
    await database.connect()

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()

@app.get('/')
def welcome():
    return {"Running": "server successfully"}

@app.get("/trees", response_model=List[TreeResponse])
async def get_trees():
    query = tree_table.select()
    return await database.fetch_all(query)

@app.post("/trees", response_model=TreeResponse)
async def create_tree(tree: TreeModel):
    query = tree_table.insert().values(tree_data=tree.tree_data)
    last_record_id = await database.execute(query)
    return {**tree.dict(), "id": last_record_id}

@app.put("/trees/{tree_id}", response_model=TreeResponse)
async def update_tree(tree_id: int, tree: TreeModel):
    query = tree_table.update().where(tree_table.c.id == tree_id).values(tree_data=tree.tree_data)
    await database.execute(query)
    return {**tree.dict(), "id": tree_id}