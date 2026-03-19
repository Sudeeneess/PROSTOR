{
  "info": {
    "_postman_id": "fc39d4a9-0a43-4088-8bfa-b5ec499d3873",
    "name": "Prostor",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    "_exporter_id": "49023465"
  },
  "item": [
    {
      "name": "Аутентификация",
      "item": [
        {
          "name": "Получить JWT токен",
          "protocolProfileBehavior": {
            "disabledSystemHeaders": {}
          },
          "request": {
            "auth": {
              "type": "noauth"
            },
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\r\n  \"username\": \"admin_user\",\r\n  \"password\": \"admin123\"\r\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "http://localhost:8083/api/auth/login",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "auth",
                "login"
              ]
            }
          },
          "response": []
        }
      ]
    },
    {
      "name": "Отладка",
      "item": [
        {
          "name": "Список всех пользователей",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbl91c2VyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczOTEwNTI0LCJleHAiOjE3NzM5OTY5MjR9.1p_FQend5-vJa8ybuOqv0_R69jlLmvXtIbinZ1caP2lktCzWMyQpwwyk1o865hNMm6HlGmeXnh_YsGsxVxewtQ",
                  "type": "string"
                }
              ]
            },
            "method": "GET",
            "header": [],
            "url": {
              "raw": "http://localhost:8083/api/debug/users",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "debug",
                "users"
              ]
            }
          },
          "response": []
        },
        {
          "name": "Пользователь по имени",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbl91c2VyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczOTEwNTI0LCJleHAiOjE3NzM5OTY5MjR9.1p_FQend5-vJa8ybuOqv0_R69jlLmvXtIbinZ1caP2lktCzWMyQpwwyk1o865hNMm6HlGmeXnh_YsGsxVxewtQ",
                  "type": "string"
                }
              ]
            },
            "method": "GET",
            "header": [],
            "url": {
              "raw": "http://localhost:8083/api/debug/user/admin_user",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "debug",
                "user",
                "admin_user"
              ]
            }
          },
          "response": []
        },
        {
          "name": "Проверка пароля",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbl91c2VyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczOTEwNTI0LCJleHAiOjE3NzM5OTY5MjR9.1p_FQend5-vJa8ybuOqv0_R69jlLmvXtIbinZ1caP2lktCzWMyQpwwyk1o865hNMm6HlGmeXnh_YsGsxVxewtQ",
                  "type": "string"
                }
              ]
            },
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{ \r\n    \"password\": \"admin123\", \r\n    \"encoded\": \"$2a$10$QshNCch2Vo4rSwN9lvl0veWseqHQagXcj6ivPyzZQ3Khdaz8cBxj.\" \r\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "http://localhost:8083/api/debug/test-password",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "debug",
                "test-password"
              ]
            }
          },
          "response": []
        },
        {
          "name": "Детальная проверка входа",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbl91c2VyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczOTEwNTI0LCJleHAiOjE3NzM5OTY5MjR9.1p_FQend5-vJa8ybuOqv0_R69jlLmvXtIbinZ1caP2lktCzWMyQpwwyk1o865hNMm6HlGmeXnh_YsGsxVxewtQ",
                  "type": "string"
                }
              ]
            },
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{ \r\n    \"username\": \"admin_user\", \r\n    \"password\": \"admin123\" \r\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "http://localhost:8083/api/debug/try-login",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "debug",
                "try-login"
              ]
            }
          },
          "response": []
        },
        {
          "name": "Список ролей",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbl91c2VyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczOTEwNTI0LCJleHAiOjE3NzM5OTY5MjR9.1p_FQend5-vJa8ybuOqv0_R69jlLmvXtIbinZ1caP2lktCzWMyQpwwyk1o865hNMm6HlGmeXnh_YsGsxVxewtQ",
                  "type": "string"
                }
              ]
            },
            "method": "GET",
            "header": [],
            "url": {
              "raw": "http://localhost:8083/api/debug/roles",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "debug",
                "roles"
              ]
            }
          },
          "response": []
        },
        {
          "name": "Упрощённый вход",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbl91c2VyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczOTEwNTI0LCJleHAiOjE3NzM5OTY5MjR9.1p_FQend5-vJa8ybuOqv0_R69jlLmvXtIbinZ1caP2lktCzWMyQpwwyk1o865hNMm6HlGmeXnh_YsGsxVxewtQ",
                  "type": "string"
                }
              ]
            },
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{ \r\n    \"username\": \"admin_user\", \r\n    \"password\": \"admin123\" \r\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "http://localhost:8083/api/debug/simple-login",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "debug",
                "simple-login"
              ]
            }
          },
          "response": []
        },
        {
          "name": "Права пользователя",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbl91c2VyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczOTEwNTI0LCJleHAiOjE3NzM5OTY5MjR9.1p_FQend5-vJa8ybuOqv0_R69jlLmvXtIbinZ1caP2lktCzWMyQpwwyk1o865hNMm6HlGmeXnh_YsGsxVxewtQ",
                  "type": "string"
                }
              ]
            },
            "method": "GET",
            "header": [],
            "url": {
              "raw": "http://localhost:8083/api/debug/user-authorities/admin_user",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "debug",
                "user-authorities",
                "admin_user"
              ]
            }
          },
          "response": []
        }
      ]
    },
    {
      "name": "Заказы",
      "item": [
        {
          "name": "Список заказов (пагинация)",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbl91c2VyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczOTEwNTI0LCJleHAiOjE3NzM5OTY5MjR9.1p_FQend5-vJa8ybuOqv0_R69jlLmvXtIbinZ1caP2lktCzWMyQpwwyk1o865hNMm6HlGmeXnh_YsGsxVxewtQ",
                  "type": "string"
                }
              ]
            },
            "method": "GET",
            "header": [],
            "url": {
              "raw": "http://localhost:8083/api/orders?page=0&size=10",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "orders"
              ],
              "query": [
                {
                  "key": "page",
                  "value": "0",
                  "type": "text"
                },
                {
                  "key": "size",
                  "value": "10",
                  "type": "text"
                }
              ]
            }
          },
          "response": []
        },
        {
          "name": "Заказ по ID",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbl91c2VyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczOTEwNTI0LCJleHAiOjE3NzM5OTY5MjR9.1p_FQend5-vJa8ybuOqv0_R69jlLmvXtIbinZ1caP2lktCzWMyQpwwyk1o865hNMm6HlGmeXnh_YsGsxVxewtQ",
                  "type": "string"
                }
              ]
            },
            "method": "GET",
            "header": [],
            "url": {
              "raw": "http://localhost:8083/api/orders/1",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "orders",
                "1"
              ]
            }
          },
          "response": []
        },
        {
          "name": "Заказы клиента",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbl91c2VyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczOTEwNTI0LCJleHAiOjE3NzM5OTY5MjR9.1p_FQend5-vJa8ybuOqv0_R69jlLmvXtIbinZ1caP2lktCzWMyQpwwyk1o865hNMm6HlGmeXnh_YsGsxVxewtQ",
                  "type": "string"
                }
              ]
            },
            "method": "GET",
            "header": [],
            "url": {
              "raw": "http://localhost:8083/api/orders/customer/2",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "orders",
                "customer",
                "2"
              ]
            }
          },
          "response": []
        },
        {
          "name": "Заказы по статусу",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbl91c2VyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczOTEwNTI0LCJleHAiOjE3NzM5OTY5MjR9.1p_FQend5-vJa8ybuOqv0_R69jlLmvXtIbinZ1caP2lktCzWMyQpwwyk1o865hNMm6HlGmeXnh_YsGsxVxewtQ",
                  "type": "string"
                }
              ]
            },
            "method": "GET",
            "header": [],
            "url": {
              "raw": "http://localhost:8083/api/orders/status/1?page=0",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "orders",
                "status",
                "1"
              ],
              "query": [
                {
                  "key": "page",
                  "value": "0",
                  "type": "text"
                }
              ]
            }
          },
          "response": []
        },
        {
          "name": "Создать заказ",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbl91c2VyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczOTEwNTI0LCJleHAiOjE3NzM5OTY5MjR9.1p_FQend5-vJa8ybuOqv0_R69jlLmvXtIbinZ1caP2lktCzWMyQpwwyk1o865hNMm6HlGmeXnh_YsGsxVxewtQ",
                  "type": "string"
                }
              ]
            },
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{ \r\n    \"customerId\": 1, \"statusId\": 1, \r\n    \"items\": [ { \"productId\": 5, \"amount\": 2 } ]\r\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "http://localhost:8083/api/orders",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "orders"
              ]
            }
          },
          "response": []
        },
        {
          "name": "Подтвердить заказ",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbl91c2VyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczOTEwNTI0LCJleHAiOjE3NzM5OTY5MjR9.1p_FQend5-vJa8ybuOqv0_R69jlLmvXtIbinZ1caP2lktCzWMyQpwwyk1o865hNMm6HlGmeXnh_YsGsxVxewtQ",
                  "type": "string"
                }
              ]
            },
            "method": "PUT",
            "header": [],
            "url": {
              "raw": "http://localhost:8083/api/orders/1/confirm",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "orders",
                "1",
                "confirm"
              ]
            }
          },
          "response": []
        },
        {
          "name": "Отменить заказ",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbl91c2VyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczOTEwNTI0LCJleHAiOjE3NzM5OTY5MjR9.1p_FQend5-vJa8ybuOqv0_R69jlLmvXtIbinZ1caP2lktCzWMyQpwwyk1o865hNMm6HlGmeXnh_YsGsxVxewtQ",
                  "type": "string"
                }
              ]
            },
            "method": "PUT",
            "header": [],
            "url": {
              "raw": "http://localhost:8083/api/orders/1/cancel",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "orders",
                "1",
                "cancel"
              ]
            }
          },
          "response": []
        },
        {
          "name": "Обновить статус заказа",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbl91c2VyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczOTEwNTI0LCJleHAiOjE3NzM5OTY5MjR9.1p_FQend5-vJa8ybuOqv0_R69jlLmvXtIbinZ1caP2lktCzWMyQpwwyk1o865hNMm6HlGmeXnh_YsGsxVxewtQ",
                  "type": "string"
                }
              ]
            },
            "method": "PUT",
            "header": [],
            "url": {
              "raw": "http://localhost:8083/api/orders/1/status/3",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "orders",
                "1",
                "status",
                "3"
              ]
            }
          },
          "response": []
        },
        {
          "name": "Удалить заказ",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbl91c2VyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczOTEwNTI0LCJleHAiOjE3NzM5OTY5MjR9.1p_FQend5-vJa8ybuOqv0_R69jlLmvXtIbinZ1caP2lktCzWMyQpwwyk1o865hNMm6HlGmeXnh_YsGsxVxewtQ",
                  "type": "string"
                }
              ]
            },
            "method": "DELETE",
            "header": [],
            "url": {
              "raw": "http://localhost:8083/api/orders/1",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "orders",
                "1"
              ]
            }
          },
          "response": []
        }
      ]
    },
    {
      "name": "Движения заказов",
      "item": [
        {
          "name": "Движения по позиции",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbl91c2VyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczOTEwNTI0LCJleHAiOjE3NzM5OTY5MjR9.1p_FQend5-vJa8ybuOqv0_R69jlLmvXtIbinZ1caP2lktCzWMyQpwwyk1o865hNMm6HlGmeXnh_YsGsxVxewtQ",
                  "type": "string"
                }
              ]
            },
            "method": "GET",
            "header": [],
            "url": {
              "raw": "http://localhost:8083/api/order-movements/order-item/1",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "order-movements",
                "order-item",
                "1"
              ]
            }
          },
          "response": []
        },
        {
          "name": "Движение по ID",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbl91c2VyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczOTEwNTI0LCJleHAiOjE3NzM5OTY5MjR9.1p_FQend5-vJa8ybuOqv0_R69jlLmvXtIbinZ1caP2lktCzWMyQpwwyk1o865hNMm6HlGmeXnh_YsGsxVxewtQ",
                  "type": "string"
                }
              ]
            },
            "method": "GET",
            "header": [],
            "url": {
              "raw": "http://localhost:8083/api/order-movements/10",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "order-movements",
                "10"
              ]
            }
          },
          "response": []
        },
        {
          "name": "Создать движение",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbl91c2VyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczOTEwNTI0LCJleHAiOjE3NzM5OTY5MjR9.1p_FQend5-vJa8ybuOqv0_R69jlLmvXtIbinZ1caP2lktCzWMyQpwwyk1o865hNMm6HlGmeXnh_YsGsxVxewtQ",
                  "type": "string"
                }
              ]
            },
            "method": "POST",
            "header": [],
            "url": {
              "raw": "http://localhost:8083/api/order-movements?orderItemId=3&warehouseId=1&statusName=RESERVED",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "order-movements"
              ],
              "query": [
                {
                  "key": "orderItemId",
                  "value": "3",
                  "type": "text"
                },
                {
                  "key": "warehouseId",
                  "value": "1",
                  "type": "text"
                },
                {
                  "key": "statusName",
                  "value": "RESERVED",
                  "type": "text"
                }
              ]
            }
          },
          "response": []
        },
        {
          "name": "Обновить статус движения",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbl91c2VyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczOTEwNTI0LCJleHAiOjE3NzM5OTY5MjR9.1p_FQend5-vJa8ybuOqv0_R69jlLmvXtIbinZ1caP2lktCzWMyQpwwyk1o865hNMm6HlGmeXnh_YsGsxVxewtQ",
                  "type": "string"
                }
              ]
            },
            "method": "PUT",
            "header": [],
            "url": {
              "raw": "http://localhost:8083/api/order-movements/10/status/SHIPPED",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "order-movements",
                "10",
                "status",
                "SHIPPED"
              ]
            }
          },
          "response": []
        }
      ]
    },
    {
      "name": "Возвраты",
      "item": [
        {
          "name": "Все возвраты",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbl91c2VyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczOTEwNTI0LCJleHAiOjE3NzM5OTY5MjR9.1p_FQend5-vJa8ybuOqv0_R69jlLmvXtIbinZ1caP2lktCzWMyQpwwyk1o865hNMm6HlGmeXnh_YsGsxVxewtQ",
                  "type": "string"
                }
              ]
            },
            "method": "GET",
            "header": [],
            "url": {
              "raw": "http://localhost:8083/api/order-returns",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "order-returns"
              ]
            }
          },
          "response": []
        },
        {
          "name": "Возврат по ID",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbl91c2VyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczOTEwNTI0LCJleHAiOjE3NzM5OTY5MjR9.1p_FQend5-vJa8ybuOqv0_R69jlLmvXtIbinZ1caP2lktCzWMyQpwwyk1o865hNMm6HlGmeXnh_YsGsxVxewtQ",
                  "type": "string"
                }
              ]
            },
            "method": "GET",
            "header": [],
            "url": {
              "raw": "http://localhost:8083/api/order-returns/1",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "order-returns",
                "1"
              ]
            }
          },
          "response": []
        },
        {
          "name": "Создать возврат",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbl91c2VyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczOTEwNTI0LCJleHAiOjE3NzM5OTY5MjR9.1p_FQend5-vJa8ybuOqv0_R69jlLmvXtIbinZ1caP2lktCzWMyQpwwyk1o865hNMm6HlGmeXnh_YsGsxVxewtQ",
                  "type": "string"
                }
              ]
            },
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "\"Не подошел размер\"",
              "options": {
                "raw": {
                  "language": "text"
                }
              }
            },
            "url": {
              "raw": "http://localhost:8083/api/order-returns/order-item/3",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "order-returns",
                "order-item",
                "3"
              ]
            }
          },
          "response": []
        },
        {
          "name": "Обновить статус возврата",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbl91c2VyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczOTEwNTI0LCJleHAiOjE3NzM5OTY5MjR9.1p_FQend5-vJa8ybuOqv0_R69jlLmvXtIbinZ1caP2lktCzWMyQpwwyk1o865hNMm6HlGmeXnh_YsGsxVxewtQ",
                  "type": "string"
                }
              ]
            },
            "method": "PUT",
            "header": [],
            "url": {
              "raw": "http://localhost:8083/api/order-returns/5/status/APPROVED",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "order-returns",
                "5",
                "status",
                "APPROVED"
              ]
            }
          },
          "response": []
        }
      ]
    },
    {
      "name": "Статусы заказов",
      "item": [
        {
          "name": "Список статусов",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbl91c2VyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczOTEwNTI0LCJleHAiOjE3NzM5OTY5MjR9.1p_FQend5-vJa8ybuOqv0_R69jlLmvXtIbinZ1caP2lktCzWMyQpwwyk1o865hNMm6HlGmeXnh_YsGsxVxewtQ",
                  "type": "string"
                }
              ]
            },
            "method": "GET",
            "header": [],
            "url": {
              "raw": "http://localhost:8083/api/orders-statuses?page=0",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "orders-statuses"
              ],
              "query": [
                {
                  "key": "page",
                  "value": "0",
                  "type": "text"
                }
              ]
            }
          },
          "response": []
        },
        {
          "name": "Статус по ID",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbl91c2VyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczOTEwNTI0LCJleHAiOjE3NzM5OTY5MjR9.1p_FQend5-vJa8ybuOqv0_R69jlLmvXtIbinZ1caP2lktCzWMyQpwwyk1o865hNMm6HlGmeXnh_YsGsxVxewtQ",
                  "type": "string"
                }
              ]
            },
            "method": "GET",
            "header": [],
            "url": {
              "raw": "http://localhost:8083/api/orders-statuses/1",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "orders-statuses",
                "1"
              ]
            }
          },
          "response": []
        },
        {
          "name": "Создать статус",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbl91c2VyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczOTEwNTI0LCJleHAiOjE3NzM5OTY5MjR9.1p_FQend5-vJa8ybuOqv0_R69jlLmvXtIbinZ1caP2lktCzWMyQpwwyk1o865hNMm6HlGmeXnh_YsGsxVxewtQ",
                  "type": "string"
                }
              ]
            },
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{ \"name\": \"PROCESSING\" }",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "http://localhost:8083/api/orders-statuses",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "orders-statuses"
              ]
            }
          },
          "response": []
        },
        {
          "name": "Обновить статус",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbl91c2VyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczOTEwNTI0LCJleHAiOjE3NzM5OTY5MjR9.1p_FQend5-vJa8ybuOqv0_R69jlLmvXtIbinZ1caP2lktCzWMyQpwwyk1o865hNMm6HlGmeXnh_YsGsxVxewtQ",
                  "type": "string"
                }
              ]
            },
            "method": "PUT",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{ \"name\": \"IN_PROGRESS\" }",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "http://localhost:8083/api/orders-statuses/1",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "orders-statuses",
                "1"
              ]
            }
          },
          "response": []
        },
        {
          "name": "Удалить статус",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbl91c2VyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczOTEwNTI0LCJleHAiOjE3NzM5OTY5MjR9.1p_FQend5-vJa8ybuOqv0_R69jlLmvXtIbinZ1caP2lktCzWMyQpwwyk1o865hNMm6HlGmeXnh_YsGsxVxewtQ",
                  "type": "string"
                }
              ]
            },
            "method": "DELETE",
            "header": [],
            "url": {
              "raw": "http://localhost:8083/api/orders-statuses/1",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "orders-statuses",
                "1"
              ]
            }
          },
          "response": []
        }
      ]
    },
    {
      "name": "Платежи",
      "item": [
        {
          "name": "Платежи по позиции",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbl91c2VyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczOTEwNTI0LCJleHAiOjE3NzM5OTY5MjR9.1p_FQend5-vJa8ybuOqv0_R69jlLmvXtIbinZ1caP2lktCzWMyQpwwyk1o865hNMm6HlGmeXnh_YsGsxVxewtQ",
                  "type": "string"
                }
              ]
            },
            "method": "GET",
            "header": [],
            "url": {
              "raw": "http://localhost:8083/api/payments/order-item/1",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "payments",
                "order-item",
                "1"
              ]
            }
          },
          "response": []
        },
        {
          "name": "Платёж по ID",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbl91c2VyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczOTEwNTI0LCJleHAiOjE3NzM5OTY5MjR9.1p_FQend5-vJa8ybuOqv0_R69jlLmvXtIbinZ1caP2lktCzWMyQpwwyk1o865hNMm6HlGmeXnh_YsGsxVxewtQ",
                  "type": "string"
                }
              ]
            },
            "method": "GET",
            "header": [],
            "url": {
              "raw": "http://localhost:8083/api/payments/1",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "payments",
                "1"
              ]
            }
          },
          "response": []
        },
        {
          "name": "Создать платёж",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbl91c2VyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczOTEwNTI0LCJleHAiOjE3NzM5OTY5MjR9.1p_FQend5-vJa8ybuOqv0_R69jlLmvXtIbinZ1caP2lktCzWMyQpwwyk1o865hNMm6HlGmeXnh_YsGsxVxewtQ",
                  "type": "string"
                }
              ]
            },
            "method": "POST",
            "header": [],
            "url": {
              "raw": "http://localhost:8083/api/payments/order-item/1",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "payments",
                "order-item",
                "1"
              ]
            }
          },
          "response": []
        },
        {
          "name": "Подтвердить платёж",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbl91c2VyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczOTEwNTI0LCJleHAiOjE3NzM5OTY5MjR9.1p_FQend5-vJa8ybuOqv0_R69jlLmvXtIbinZ1caP2lktCzWMyQpwwyk1o865hNMm6HlGmeXnh_YsGsxVxewtQ",
                  "type": "string"
                }
              ]
            },
            "method": "PUT",
            "header": [],
            "url": {
              "raw": "http://localhost:8083/api/payments/1/confirm",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "payments",
                "1",
                "confirm"
              ]
            }
          },
          "response": []
        }
      ]
    },
    {
      "name": "Бренды",
      "item": [
        {
          "name": "Список брендов",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbl91c2VyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczOTEwNTI0LCJleHAiOjE3NzM5OTY5MjR9.1p_FQend5-vJa8ybuOqv0_R69jlLmvXtIbinZ1caP2lktCzWMyQpwwyk1o865hNMm6HlGmeXnh_YsGsxVxewtQ",
                  "type": "string"
                }
              ]
            },
            "method": "GET",
            "header": [],
            "url": {
              "raw": "http://localhost:8083/api/brands?page=0",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "brands"
              ],
              "query": [
                {
                  "key": "page",
                  "value": "0",
                  "type": "text"
                }
              ]
            }
          },
          "response": []
        },
        {
          "name": "Бренд по ID",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbl91c2VyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczOTEwNTI0LCJleHAiOjE3NzM5OTY5MjR9.1p_FQend5-vJa8ybuOqv0_R69jlLmvXtIbinZ1caP2lktCzWMyQpwwyk1o865hNMm6HlGmeXnh_YsGsxVxewtQ",
                  "type": "string"
                }
              ]
            },
            "method": "GET",
            "header": [],
            "url": {
              "raw": "http://localhost:8083/api/brands/1",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "brands",
                "1"
              ]
            }
          },
          "response": []
        },
        {
          "name": "Создать бренд",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbl91c2VyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczOTEwNTI0LCJleHAiOjE3NzM5OTY5MjR9.1p_FQend5-vJa8ybuOqv0_R69jlLmvXtIbinZ1caP2lktCzWMyQpwwyk1o865hNMm6HlGmeXnh_YsGsxVxewtQ",
                  "type": "string"
                }
              ]
            },
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{ \"name\": \"Adidas\" }",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "http://localhost:8083/api/brands",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "brands"
              ]
            }
          },
          "response": []
        },
        {
          "name": "Обновить бренд",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbl91c2VyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczOTEwNTI0LCJleHAiOjE3NzM5OTY5MjR9.1p_FQend5-vJa8ybuOqv0_R69jlLmvXtIbinZ1caP2lktCzWMyQpwwyk1o865hNMm6HlGmeXnh_YsGsxVxewtQ",
                  "type": "string"
                }
              ]
            },
            "method": "PUT",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{ \"name\": \"Adidas Updated\" }",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "http://localhost:8083/api/brands/1",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "brands",
                "1"
              ]
            }
          },
          "response": []
        },
        {
          "name": "Удалить бренд",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbl91c2VyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczOTEwNTI0LCJleHAiOjE3NzM5OTY5MjR9.1p_FQend5-vJa8ybuOqv0_R69jlLmvXtIbinZ1caP2lktCzWMyQpwwyk1o865hNMm6HlGmeXnh_YsGsxVxewtQ",
                  "type": "string"
                }
              ]
            },
            "method": "DELETE",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{ \"name\": \"Adidas\" }"
            },
            "url": {
              "raw": "http://localhost:8083/api/brands/2",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "brands",
                "2"
              ]
            }
          },
          "response": []
        }
      ]
    },
    {
      "name": "Категории",
      "item": [
        {
          "name": "Список категорий",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbl91c2VyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczOTEwNTI0LCJleHAiOjE3NzM5OTY5MjR9.1p_FQend5-vJa8ybuOqv0_R69jlLmvXtIbinZ1caP2lktCzWMyQpwwyk1o865hNMm6HlGmeXnh_YsGsxVxewtQ",
                  "type": "string"
                }
              ]
            },
            "method": "GET",
            "header": [],
            "url": {
              "raw": "http://localhost:8083/api/categories?page=0",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "categories"
              ],
              "query": [
                {
                  "key": "page",
                  "value": "0"
                }
              ]
            }
          },
          "response": []
        },
        {
          "name": "Категория по ID",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbl91c2VyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczOTEwNTI0LCJleHAiOjE3NzM5OTY5MjR9.1p_FQend5-vJa8ybuOqv0_R69jlLmvXtIbinZ1caP2lktCzWMyQpwwyk1o865hNMm6HlGmeXnh_YsGsxVxewtQ",
                  "type": "string"
                }
              ]
            },
            "method": "GET",
            "header": [],
            "url": {
              "raw": "http://localhost:8083/api/categories/1",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "categories",
                "1"
              ]
            }
          },
          "response": []
        },
        {
          "name": "Создать категорию",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbl91c2VyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczOTEwNTI0LCJleHAiOjE3NzM5OTY5MjR9.1p_FQend5-vJa8ybuOqv0_R69jlLmvXtIbinZ1caP2lktCzWMyQpwwyk1o865hNMm6HlGmeXnh_YsGsxVxewtQ",
                  "type": "string"
                }
              ]
            },
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{ \"categoryName\": \"Одежда\" }",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "http://localhost:8083/api/categories",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "categories"
              ]
            }
          },
          "response": []
        },
        {
          "name": "Обновить категорию",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbl91c2VyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczOTEwNTI0LCJleHAiOjE3NzM5OTY5MjR9.1p_FQend5-vJa8ybuOqv0_R69jlLmvXtIbinZ1caP2lktCzWMyQpwwyk1o865hNMm6HlGmeXnh_YsGsxVxewtQ",
                  "type": "string"
                }
              ]
            },
            "method": "PUT",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{ \"categoryName\": \"Аксессуары\" }",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "http://localhost:8083/api/categories/1",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "categories",
                "1"
              ]
            }
          },
          "response": []
        },
        {
          "name": "Удалить категорию",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbl91c2VyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczOTEwNTI0LCJleHAiOjE3NzM5OTY5MjR9.1p_FQend5-vJa8ybuOqv0_R69jlLmvXtIbinZ1caP2lktCzWMyQpwwyk1o865hNMm6HlGmeXnh_YsGsxVxewtQ",
                  "type": "string"
                }
              ]
            },
            "method": "DELETE",
            "header": [],
            "url": {
              "raw": "http://localhost:8083/api/categories/2",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "categories",
                "2"
              ]
            }
          },
          "response": []
        }
      ]
    },
    {
      "name": "Карточки товаров",
      "item": [
        {
          "name": "Карточки товара",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbl91c2VyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczOTEwNTI0LCJleHAiOjE3NzM5OTY5MjR9.1p_FQend5-vJa8ybuOqv0_R69jlLmvXtIbinZ1caP2lktCzWMyQpwwyk1o865hNMm6HlGmeXnh_YsGsxVxewtQ",
                  "type": "string"
                }
              ]
            },
            "method": "GET",
            "header": [],
            "url": {
              "raw": "http://localhost:8083/api/products/1/cards",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "products",
                "1",
                "cards"
              ]
            }
          },
          "response": []
        },
        {
          "name": "Карточка по ID",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbl91c2VyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczOTEwNTI0LCJleHAiOjE3NzM5OTY5MjR9.1p_FQend5-vJa8ybuOqv0_R69jlLmvXtIbinZ1caP2lktCzWMyQpwwyk1o865hNMm6HlGmeXnh_YsGsxVxewtQ",
                  "type": "string"
                }
              ]
            },
            "method": "GET",
            "header": [],
            "url": {
              "raw": "http://localhost:8083/api/products/1/cards/1",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "products",
                "1",
                "cards",
                "1"
              ]
            }
          },
          "response": []
        },
        {
          "name": "Создать карточку",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbl91c2VyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczOTEwNTI0LCJleHAiOjE3NzM5OTY5MjR9.1p_FQend5-vJa8ybuOqv0_R69jlLmvXtIbinZ1caP2lktCzWMyQpwwyk1o865hNMm6HlGmeXnh_YsGsxVxewtQ",
                  "type": "string"
                }
              ]
            },
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{ \"productId\": 5, \"brandId\": 1, \"sizeId\": 3, \"description\": \"Новая карточка\", \"type\": \"Кроссовки\", \"photo\": [ { \"url\": \"http://...\", \"alt\": \"...\" } ], \"isActive\": true }",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "http://localhost:8083/api/products/1/cards",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "products",
                "1",
                "cards"
              ]
            }
          },
          "response": []
        },
        {
          "name": "Обновить карточку",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbl91c2VyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczOTEwNTI0LCJleHAiOjE3NzM5OTY5MjR9.1p_FQend5-vJa8ybuOqv0_R69jlLmvXtIbinZ1caP2lktCzWMyQpwwyk1o865hNMm6HlGmeXnh_YsGsxVxewtQ",
                  "type": "string"
                }
              ]
            },
            "method": "PUT",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{ \"productId\": 5, \"brandId\": 1, \"sizeId\": 3, \"description\": \"Новая карточка\", \"type\": \"Кроссовки\", \"photo\": [ { \"url\": \"http://...\", \"alt\": \"...\" } ], \"isActive\": true }",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "http://localhost:8083/api/products/1/cards/1",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "products",
                "1",
                "cards",
                "1"
              ]
            }
          },
          "response": []
        },
        {
          "name": "Удалить карточку",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbl91c2VyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczOTEwNTI0LCJleHAiOjE3NzM5OTY5MjR9.1p_FQend5-vJa8ybuOqv0_R69jlLmvXtIbinZ1caP2lktCzWMyQpwwyk1o865hNMm6HlGmeXnh_YsGsxVxewtQ",
                  "type": "string"
                }
              ]
            },
            "method": "DELETE",
            "header": [],
            "url": {
              "raw": "http://localhost:8083/api/products/1/cards/1",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "products",
                "1",
                "cards",
                "1"
              ]
            }
          },
          "response": []
        }
      ]
    },
    {
      "name": "Товары",
      "item": [
        {
          "name": "Фильтр товаров",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbl91c2VyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczOTEwNTI0LCJleHAiOjE3NzM5OTY5MjR9.1p_FQend5-vJa8ybuOqv0_R69jlLmvXtIbinZ1caP2lktCzWMyQpwwyk1o865hNMm6HlGmeXnh_YsGsxVxewtQ",
                  "type": "string"
                }
              ]
            },
            "method": "GET",
            "header": [],
            "url": {
              "raw": "http://localhost:8083/api/products?categoryId=1&sellerId=1&minPrice=100&maxPrice=5000&name=футболка&page=0",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "products"
              ],
              "query": [
                {
                  "key": "categoryId",
                  "value": "1",
                  "type": "text"
                },
                {
                  "key": "sellerId",
                  "value": "1",
                  "type": "text"
                },
                {
                  "key": "minPrice",
                  "value": "100",
                  "type": "text"
                },
                {
                  "key": "maxPrice",
                  "value": "5000",
                  "type": "text"
                },
                {
                  "key": "name",
                  "value": "футболка",
                  "type": "text"
                },
                {
                  "key": "page",
                  "value": "0",
                  "type": "text"
                }
              ]
            }
          },
          "response": []
        },
        {
          "name": "Товар по ID",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbl91c2VyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczOTEwNTI0LCJleHAiOjE3NzM5OTY5MjR9.1p_FQend5-vJa8ybuOqv0_R69jlLmvXtIbinZ1caP2lktCzWMyQpwwyk1o865hNMm6HlGmeXnh_YsGsxVxewtQ",
                  "type": "string"
                }
              ]
            },
            "method": "GET",
            "header": [],
            "url": {
              "raw": "http://localhost:8083/api/products/1",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "products",
                "1"
              ]
            }
          },
          "response": []
        },
        {
          "name": "Создать товар",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbl91c2VyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczOTEwNTI0LCJleHAiOjE3NzM5OTY5MjR9.1p_FQend5-vJa8ybuOqv0_R69jlLmvXtIbinZ1caP2lktCzWMyQpwwyk1o865hNMm6HlGmeXnh_YsGsxVxewtQ",
                  "type": "string"
                }
              ]
            },
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{ \"name\": \"Кроссовки Adidas\", \"price\": 3500.0, \"sellerId\": 1, \"categoryId\": 1, \"parentId\": null }",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "http://localhost:8083/api/products",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "products"
              ]
            }
          },
          "response": []
        },
        {
          "name": "Обновить товар",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbl91c2VyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczOTEwNTI0LCJleHAiOjE3NzM5OTY5MjR9.1p_FQend5-vJa8ybuOqv0_R69jlLmvXtIbinZ1caP2lktCzWMyQpwwyk1o865hNMm6HlGmeXnh_YsGsxVxewtQ",
                  "type": "string"
                }
              ]
            },
            "method": "PUT",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\r\n    \"name\": \"Новое название\",\r\n    \"price\": 3500.0,\r\n    \"sellerId\": 3,\r\n    \"categoryId\": 1,\r\n    \"parentId\": null\r\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "http://localhost:8083/api/products/1",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "products",
                "1"
              ]
            }
          },
          "response": []
        },
        {
          "name": "Удалить товар",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbl91c2VyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczOTEwNTI0LCJleHAiOjE3NzM5OTY5MjR9.1p_FQend5-vJa8ybuOqv0_R69jlLmvXtIbinZ1caP2lktCzWMyQpwwyk1o865hNMm6HlGmeXnh_YsGsxVxewtQ",
                  "type": "string"
                }
              ]
            },
            "method": "DELETE",
            "header": [],
            "url": {
              "raw": "http://localhost:8083/api/products/1",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "products",
                "1"
              ]
            }
          },
          "response": []
        }
      ]
    },
    {
      "name": "Размеры",
      "item": [
        {
          "name": "Список размеров",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbl91c2VyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczOTEwNTI0LCJleHAiOjE3NzM5OTY5MjR9.1p_FQend5-vJa8ybuOqv0_R69jlLmvXtIbinZ1caP2lktCzWMyQpwwyk1o865hNMm6HlGmeXnh_YsGsxVxewtQ",
                  "type": "string"
                }
              ]
            },
            "method": "GET",
            "header": [],
            "url": {
              "raw": "http://localhost:8083/api/sizes?page=0",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "sizes"
              ],
              "query": [
                {
                  "key": "page",
                  "value": "0",
                  "type": "text"
                }
              ]
            }
          },
          "response": []
        },
        {
          "name": "Размер по ID",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbl91c2VyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczOTEwNTI0LCJleHAiOjE3NzM5OTY5MjR9.1p_FQend5-vJa8ybuOqv0_R69jlLmvXtIbinZ1caP2lktCzWMyQpwwyk1o865hNMm6HlGmeXnh_YsGsxVxewtQ",
                  "type": "string"
                }
              ]
            },
            "method": "GET",
            "header": [],
            "url": {
              "raw": "http://localhost:8083/api/sizes/1",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "sizes",
                "1"
              ]
            }
          },
          "response": []
        },
        {
          "name": "Создать размер",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbl91c2VyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczOTEwNTI0LCJleHAiOjE3NzM5OTY5MjR9.1p_FQend5-vJa8ybuOqv0_R69jlLmvXtIbinZ1caP2lktCzWMyQpwwyk1o865hNMm6HlGmeXnh_YsGsxVxewtQ",
                  "type": "string"
                }
              ]
            },
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{ \"name\": \"XL\" }",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "http://localhost:8083/api/sizes",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "sizes"
              ]
            }
          },
          "response": []
        },
        {
          "name": "Обновить размер",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbl91c2VyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczOTEwNTI0LCJleHAiOjE3NzM5OTY5MjR9.1p_FQend5-vJa8ybuOqv0_R69jlLmvXtIbinZ1caP2lktCzWMyQpwwyk1o865hNMm6HlGmeXnh_YsGsxVxewtQ",
                  "type": "string"
                }
              ]
            },
            "method": "PUT",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{ \"name\": \"XXL\" }",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "http://localhost:8083/api/sizes/1",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "sizes",
                "1"
              ]
            }
          },
          "response": []
        },
        {
          "name": "Удалить размер",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbl91c2VyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczOTEwNTI0LCJleHAiOjE3NzM5OTY5MjR9.1p_FQend5-vJa8ybuOqv0_R69jlLmvXtIbinZ1caP2lktCzWMyQpwwyk1o865hNMm6HlGmeXnh_YsGsxVxewtQ",
                  "type": "string"
                }
              ]
            },
            "method": "DELETE",
            "header": [],
            "url": {
              "raw": "http://localhost:8083/api/sizes/5",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "sizes",
                "5"
              ]
            }
          },
          "response": []
        }
      ]
    },
    {
      "name": "Дашборды по ролям",
      "item": [
        {
          "name": "Панель администратора",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbl91c2VyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczOTEwNTI0LCJleHAiOjE3NzM5OTY5MjR9.1p_FQend5-vJa8ybuOqv0_R69jlLmvXtIbinZ1caP2lktCzWMyQpwwyk1o865hNMm6HlGmeXnh_YsGsxVxewtQ",
                  "type": "string"
                }
              ]
            },
            "method": "GET",
            "header": [],
            "url": {
              "raw": "http://localhost:8083/api/admin/dashboard",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "admin",
                "dashboard"
              ]
            }
          },
          "response": []
        },
        {
          "name": "Панель покупателя",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbl91c2VyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczOTEwNTI0LCJleHAiOjE3NzM5OTY5MjR9.1p_FQend5-vJa8ybuOqv0_R69jlLmvXtIbinZ1caP2lktCzWMyQpwwyk1o865hNMm6HlGmeXnh_YsGsxVxewtQ",
                  "type": "string"
                }
              ]
            },
            "method": "GET",
            "header": [],
            "url": {
              "raw": "http://localhost:8083/api/customer/dashboard",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "customer",
                "dashboard"
              ]
            }
          },
          "response": []
        },
        {
          "name": "Панель склада",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "http://localhost:8083/api/warehouse/dashboard",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "warehouse",
                "dashboard"
              ]
            }
          },
          "response": []
        },
        {
          "name": "Панель продавца",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbl91c2VyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczOTEwNTI0LCJleHAiOjE3NzM5OTY5MjR9.1p_FQend5-vJa8ybuOqv0_R69jlLmvXtIbinZ1caP2lktCzWMyQpwwyk1o865hNMm6HlGmeXnh_YsGsxVxewtQ",
                  "type": "string"
                }
              ]
            },
            "method": "GET",
            "header": [],
            "url": {
              "raw": "http://localhost:8083/api/seller/dashboard",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "seller",
                "dashboard"
              ]
            }
          },
          "response": []
        }
      ]
    },
    {
      "name": "Складские остатки",
      "item": [
        {
          "name": "Остатки с фильтром",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbl91c2VyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczOTEwNTI0LCJleHAiOjE3NzM5OTY5MjR9.1p_FQend5-vJa8ybuOqv0_R69jlLmvXtIbinZ1caP2lktCzWMyQpwwyk1o865hNMm6HlGmeXnh_YsGsxVxewtQ",
                  "type": "string"
                }
              ]
            },
            "method": "GET",
            "header": [],
            "url": {
              "raw": "http://localhost:8083/api/warehouse-stocks?warehouseId=1&productId=1",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "warehouse-stocks"
              ],
              "query": [
                {
                  "key": "warehouseId",
                  "value": "1",
                  "type": "text"
                },
                {
                  "key": "productId",
                  "value": "1",
                  "type": "text"
                }
              ]
            }
          },
          "response": []
        },
        {
          "name": "Остаток по ID",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbl91c2VyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczOTEwNTI0LCJleHAiOjE3NzM5OTY5MjR9.1p_FQend5-vJa8ybuOqv0_R69jlLmvXtIbinZ1caP2lktCzWMyQpwwyk1o865hNMm6HlGmeXnh_YsGsxVxewtQ",
                  "type": "string"
                }
              ]
            },
            "method": "GET",
            "header": [],
            "url": {
              "raw": "http://localhost:8083/api/warehouse-stocks/1",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "warehouse-stocks",
                "1"
              ]
            }
          },
          "response": []
        },
        {
          "name": "Создать остаток",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbl91c2VyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczOTEwNTI0LCJleHAiOjE3NzM5OTY5MjR9.1p_FQend5-vJa8ybuOqv0_R69jlLmvXtIbinZ1caP2lktCzWMyQpwwyk1o865hNMm6HlGmeXnh_YsGsxVxewtQ",
                  "type": "string"
                }
              ]
            },
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{ \"warehouseId\": 1, \"productId\": 1, \"quantity\": 150 }",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "http://localhost:8083/api/warehouse-stocks",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "warehouse-stocks"
              ]
            }
          },
          "response": []
        },
        {
          "name": "Обновить остаток",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbl91c2VyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczOTEwNTI0LCJleHAiOjE3NzM5OTY5MjR9.1p_FQend5-vJa8ybuOqv0_R69jlLmvXtIbinZ1caP2lktCzWMyQpwwyk1o865hNMm6HlGmeXnh_YsGsxVxewtQ",
                  "type": "string"
                }
              ]
            },
            "method": "PUT",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{ \"warehouseId\": 1, \"productId\": 5, \"quantity\": 200 }",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "http://localhost:8083/api/warehouse-stocks/1",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "warehouse-stocks",
                "1"
              ]
            }
          },
          "response": []
        },
        {
          "name": "Удалить остаток",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbl91c2VyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczOTEwNTI0LCJleHAiOjE3NzM5OTY5MjR9.1p_FQend5-vJa8ybuOqv0_R69jlLmvXtIbinZ1caP2lktCzWMyQpwwyk1o865hNMm6HlGmeXnh_YsGsxVxewtQ",
                  "type": "string"
                }
              ]
            },
            "method": "DELETE",
            "header": [],
            "url": {
              "raw": "http://localhost:8083/api/warehouse-stocks/1",
              "protocol": "http",
              "host": [
                "localhost"
              ],
              "port": "8083",
              "path": [
                "api",
                "warehouse-stocks",
                "1"
              ]
            }
          },
          "response": []
        }
      ]
    }
  ],
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "",
        "type": "string"
      }
    ]
  },
  "event": [
    {
      "listen": "prerequest",
      "script": {
        "type": "text/javascript",
        "packages": {},
        "requests": {},
        "exec": [
          ""
        ]
      }
    },
    {
      "listen": "test",
      "script": {
        "type": "text/javascript",
        "packages": {},
        "requests": {},
        "exec": [
          ""
        ]
      }
    }
  ]
}