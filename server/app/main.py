from fastapi import FastAPI, Query, HTTPException
from starlette.middleware.cors import CORSMiddleware
import asyncpg
from typing import List
from pydantic import BaseModel
from datetime import date

app = FastAPI()

# Added CORS allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

async def connect_to_db():
    return await asyncpg.connect(user='postgres', password='postgres',
    database='nbp_service', host='postgres')

async def create_table():
    connection = await connect_to_db()
    query = """
    CREATE TABLE IF NOT EXISTS exchange_rates (
        currency VARCHAR(3) NOT NULL,
        effective_date DATE NOT NULL,
        rate FLOAT NOT NULL,
        PRIMARY KEY (currency, effective_date)
    );
    """
    await connection.execute(query)
    await connection.close()

# Invoke startup event to create table for new instances
@app.on_event("startup")
async def on_startup():
    await create_table()

async def get_from_db(currency_type: str = Query('pln')):
    connection = await connect_to_db()
    rows=[]
    query_daily = f"SELECT * FROM exchange_rates WHERE currency=UPPER('{currency_type}') ORDER BY effective_date DESC LIMIT 1;"
    rows.insert(0, await connection.fetch(query_daily))
    query_monthly = f"SELECT * FROM exchange_rates WHERE currency=UPPER('{currency_type}') AND effective_date >= date_trunc('month', CURRENT_DATE - interval '1' month) and effective_date < date_trunc('month', CURRENT_DATE);"
    rows.insert(1, await connection.fetch(query_monthly))
    query_quaterly = f"SELECT * FROM exchange_rates WHERE currency=UPPER('{currency_type}') AND effective_date > CURRENT_DATE - INTERVAL '3 months'"
    rows.insert(2, await connection.fetch(query_quaterly))
    query_yearly = f"SELECT * FROM exchange_rates WHERE currency=UPPER('{currency_type}') AND effective_date >= CURRENT_DATE - interval '1' year AND effective_date < CURRENT_DATE;"
    rows.insert(3, await connection.fetch(query_yearly))
    await connection.close()
    return rows

async def save_data_to_db(data: List[dict]):
    connection = await connect_to_db()
    try:
        query = """
            INSERT INTO exchange_rates (currency, effective_date, rate)
            VALUES ($1, $2, $3)
            ON CONFLICT (currency, effective_date) DO UPDATE 
                SET rate = excluded.rate;
        """
        for record in data:
            await connection.execute(query, record['currency'], record['effective_date'],
            record['rate'])
    except Exception as e:
        await connection.close()
        raise HTTPException(status_code=500, detail=str(e))
    await connection.close()

# Class for currency model
class CurrencyRate(BaseModel):
    ID: int = None  # Optional ID field for existing records
    currency: str
    effective_date: date
    rate: float

# GET
@app.get("/data/")
async def get_data(currency_type: str = Query('pln')):
    data = await get_from_db(currency_type)
    return data

# SET
@app.post("/data/")
async def post_data(data: List[CurrencyRate]):
    await save_data_to_db([record.dict() for record in data])
    return {"status": "success"}
