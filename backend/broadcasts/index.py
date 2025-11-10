"""
Business: Управление рассылками (создание, отправка, статистика)
Args: event - dict с httpMethod, body, queryStringParameters
      context - объект с атрибутами request_id, function_name
Returns: HTTP response dict с данными рассылок
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
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
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
            broadcast_id = path_params.get('id')
            
            if broadcast_id:
                cur.execute(
                    'SELECT * FROM broadcasts WHERE id = %s',
                    (int(broadcast_id),)
                )
                broadcast = cur.fetchone()
                
                if not broadcast:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Broadcast not found'}),
                        'isBase64Encoded': False
                    }
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(dict(broadcast), default=str),
                    'isBase64Encoded': False
                }
            
            cur.execute('SELECT * FROM broadcasts ORDER BY created_at DESC LIMIT 100')
            broadcasts = [dict(row) for row in cur.fetchall()]
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(broadcasts, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            required_fields = ['name', 'message']
            for field in required_fields:
                if field not in body_data:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': f'Missing required field: {field}'}),
                        'isBase64Encoded': False
                    }
            
            target_segment = body_data.get('target_segment', 'all')
            
            if target_segment == 'all':
                cur.execute('SELECT id FROM leads')
            else:
                cur.execute('SELECT id FROM leads WHERE stage = %s', (target_segment,))
            
            target_lead_ids = [row['id'] for row in cur.fetchall()]
            
            cur.execute(
                '''
                INSERT INTO broadcasts (user_id, name, message, target_segment, status)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING *
                ''',
                (
                    1,
                    body_data['name'],
                    body_data['message'],
                    target_segment,
                    'draft'
                )
            )
            
            new_broadcast = dict(cur.fetchone())
            broadcast_id = new_broadcast['id']
            
            for lead_id in target_lead_ids:
                cur.execute(
                    '''
                    INSERT INTO broadcast_recipients (broadcast_id, lead_id, status)
                    VALUES (%s, %s, %s)
                    ''',
                    (broadcast_id, lead_id, 'pending')
                )
            
            conn.commit()
            
            new_broadcast['recipients_count'] = len(target_lead_ids)
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(new_broadcast, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            path_params = event.get('pathParams', {})
            broadcast_id = path_params.get('id')
            
            if not broadcast_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Broadcast ID is required'}),
                    'isBase64Encoded': False
                }
            
            body_data = json.loads(event.get('body', '{}'))
            
            if 'status' in body_data:
                cur.execute(
                    '''
                    UPDATE broadcasts 
                    SET status = %s
                    WHERE id = %s
                    RETURNING *
                    ''',
                    (body_data['status'], int(broadcast_id))
                )
                
                updated_broadcast = cur.fetchone()
                if not updated_broadcast:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Broadcast not found'}),
                        'isBase64Encoded': False
                    }
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(dict(updated_broadcast), default=str),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'No valid fields to update'}),
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
