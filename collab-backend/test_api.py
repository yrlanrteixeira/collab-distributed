"""
Script de teste simples para validar a API
Execute o servidor primeiro com: python run.py
"""
import requests
import time

BASE_URL = "http://localhost:8000"


def test_api():
    print("=" * 60)
    print("Testando API do Editor Colaborativo")
    print("=" * 60)

    # 1. Verificar servidor
    print("\n[1] Verificando servidor...")
    response = requests.get(f"{BASE_URL}/")
    print(f"✓ Servidor online: {response.json()['message']}")

    # 2. Obter estado inicial
    print("\n[2] Obtendo estado inicial...")
    response = requests.get(f"{BASE_URL}/state")
    state = response.json()
    print(f"✓ Conteúdo: '{state['content']}'")
    print(f"✓ Lamport Clock: {state['lamport_clock']}")
    print(f"✓ Lock Holder: {state['lock_holder']}")

    # 3. Cliente A tenta adquirir lock
    print("\n[3] Cliente A adquirindo lock...")
    response = requests.post(f"{BASE_URL}/lock/acquire", json={"client_id": "client-A"})
    result = response.json()
    print(f"✓ Sucesso: {result['success']}")
    print(f"✓ Mensagem: {result['message']}")

    # 4. Cliente A atualiza documento
    print("\n[4] Cliente A atualizando documento...")
    response = requests.post(f"{BASE_URL}/document/update", json={
        "client_id": "client-A",
        "content": "Hello from distributed systems!",
        "client_clock": 5
    })
    result = response.json()
    print(f"✓ Sucesso: {result['success']}")
    print(f"✓ Novo Lamport Clock: {result['new_lamport_clock']}")

    # 5. Cliente B tenta adquirir lock (deve falhar)
    print("\n[5] Cliente B tentando adquirir lock (deve falhar)...")
    response = requests.post(f"{BASE_URL}/lock/acquire", json={"client_id": "client-B"})
    result = response.json()
    print(f"✓ Sucesso: {result['success']}")
    print(f"✓ Mensagem: {result['message']}")
    print(f"✓ Lock pertence a: {result['lock_holder']}")

    # 6. Cliente A libera lock
    print("\n[6] Cliente A liberando lock...")
    response = requests.post(f"{BASE_URL}/lock/release", json={"client_id": "client-A"})
    result = response.json()
    print(f"✓ Sucesso: {result['success']}")
    print(f"✓ Mensagem: {result['message']}")

    # 7. Cliente B adquire lock (agora deve funcionar)
    print("\n[7] Cliente B adquirindo lock (agora deve funcionar)...")
    response = requests.post(f"{BASE_URL}/lock/acquire", json={"client_id": "client-B"})
    result = response.json()
    print(f"✓ Sucesso: {result['success']}")
    print(f"✓ Mensagem: {result['message']}")

    # 8. Estado final
    print("\n[8] Estado final do sistema...")
    response = requests.get(f"{BASE_URL}/state")
    state = response.json()
    print(f"✓ Conteúdo: '{state['content']}'")
    print(f"✓ Lamport Clock: {state['lamport_clock']}")
    print(f"✓ Lock Holder: {state['lock_holder']}")

    print("\n" + "=" * 60)
    print("Todos os testes passaram com sucesso!")
    print("=" * 60)


if __name__ == "__main__":
    try:
        test_api()
    except requests.exceptions.ConnectionError:
        print("\n❌ ERRO: Não foi possível conectar ao servidor.")
        print("   Certifique-se de que o servidor está rodando com: python run.py")
    except Exception as e:
        print(f"\n❌ ERRO: {e}")
