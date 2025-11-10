"""
Business: CRUD операции для управления лидами в CRM
Args: event - dict с httpMethod, body, queryStringParameters, pathParams
      context - объект с атрибутами request_id, function_name
Returns: HTTP response dict с данными лидов
"""

import json
import os
from typing import Dict, Any
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn, cursor_factory=RealDictCursor)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        if method == 'GET':
            path_params = event.get('pathParams', {})
            lead_id = path_params.get('id')
            
            if lead_id:
                cur.execute(
                    'SELECT * FROM leads WHERE id = %s',
                    (int(lead_id),)
                )
                lead = cur.fetchone()
                
                if not lead:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Lead not found'}),
                        'isBase64Encoded': False
                    }
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(dict(lead), default=str),
                    'isBase64Encoded': False
                }
            
            query_params = event.get('queryStringParameters', {})
            stage = query_params.get('stage')
            
            if stage:
                cur.execute(
                    'SELECT * FROM leads WHERE stage = %s ORDER BY created_at DESC',
                    (stage,)
                )
            else:
                cur.execute('SELECT * FROM leads ORDER BY created_at DESC')
            
            leads = [dict(row) for row in cur.fetchall()]
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(leads, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            required_fields = ['name']
            for field in required_fields:
                if field not in body_data:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': f'Missing required field: {field}'}),
                        'isBase64Encoded': False
                    }
            
            cur.execute(
                '''
                INSERT INTO leads (user_id, name, username, telegram_id, stage, value, notes, last_contact)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING *
                ''',
                (
                    1,
                    body_data['name'],
                    body_data.get('username'),
                    body_data.get('telegram_id'),
                    body_data.get('stage', 'new'),
                    body_data.get('value', 0),
                    body_data.get('notes'),
                    datetime.now()
                )
            )
            
            new_lead = dict(cur.fetchone())
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(new_lead, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            path_params = event.get('pathParams', {})
            lead_id = path_params.get('id')
            
            if not lead_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Lead ID is required'}),
                    'isBase64Encoded': False
                }
            
            body_data = json.loads(event.get('body', '{}'))
            
            update_fields = []
            values = []
            
            allowed_fields = ['name', 'username', 'telegram_id', 'stage', 'value', 'notes']
            for field in allowed_fields:
                if field in body_data:
                    update_fields.append(f'{field} = %s')
                    values.append(body_data[field])
            
            if not update_fields:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'No fields to update'}),
                    'isBase64Encoded': False
                }
            
            update_fields.append('updated_at = %s')
            values.append(datetime.now())
            values.append(int(lead_id))
            
            cur.execute(
                f'''
                UPDATE leads 
                SET {', '.join(update_fields)}
                WHERE id = %s
                RETURNING *
                ''',
                values
            )
            
            updated_lead = cur.fetchone()
            if not updated_lead:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Lead not found'}),
                    'isBase64Encoded': False
                }
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(dict(updated_lead), default=str),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
    
    finally:
        cur.close()
        conn.close()
