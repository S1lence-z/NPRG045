import pymongo as pm

def _get_collection_from_db(collection_name: str):
    DB_NAME = 'main'
    client = pm.MongoClient('localhost', 27017)
    acconeer_db = client[DB_NAME]
    return acconeer_db[collection_name]

def insert_result_to_db(result: dict, collection_name: str = 'amp_phase_test') -> None:
    result_collection = _get_collection_from_db(collection_name)
    result_collection.insert_one(result)
    print('Result inserted to database')