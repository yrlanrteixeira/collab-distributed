"""
Script de inicialização do servidor
Executa a aplicação FastAPI
"""
import uvicorn

if __name__ == "__main__":
    print("=" * 60)
    print("Editor de Texto Colaborativo - Servidor Iniciando")
    print("=" * 60)
    print("Algoritmos Implementados:")
    print("  1. Exclusão Mútua (Lock Centralizado)")
    print("  2. Relógios Lógicos de Lamport")
    print("  3. Tratamento de Falhas (Timeout: 15s)")
    print("=" * 60)
    print("Servidor rodando em: http://localhost:8000")
    print("Documentação interativa: http://localhost:8000/docs")
    print("=" * 60)
    print()

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True  # Recarrega automaticamente ao detectar mudanças no código
    )
