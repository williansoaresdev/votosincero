#!/usr/bin/env python3
"""Valida objetivos.json antes de commitar/publicar.

Uso:  python scripts/validar_objetivos.py
Sai com código 1 se houver erro (o workflow de deploy também roda este script).
"""
import json
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
STATUS = {"nao_avaliado", "nao_iniciado", "em_andamento", "mantido", "atrasado", "cumprido", "descumprido"}
TIPOS = {"meta", "medida", "continuidade"}
ESFERAS = {
    "Educação", "Economia", "Saúde", "Segurança", "Transporte", "Meio Ambiente",
    "Desenvolvimento Social", "Relações Internacionais", "Ciência e Tecnologia",
    "Trabalho e Previdência", "Gestão Pública", "Agricultura",
}
DATA = re.compile(r"^\d{4}-\d{2}-\d{2}$")

erros = []
avisos = []


def erro(msg):
    erros.append(msg)


def main():
    caminho = RAIZ / "objetivos.json"
    try:
        doc = json.loads(caminho.read_text(encoding="utf-8"))
    except Exception as e:  # JSON inválido
        print(f"ERRO: objetivos.json inválido: {e}")
        return 1

    if not DATA.match(doc.get("atualizado_em", "")):
        erro("atualizado_em ausente ou fora do formato AAAA-MM-DD")

    ids = set()
    ultima_data_global = ""
    for o in doc.get("objetivos", []):
        oid = o.get("id", "?")
        if oid in ids:
            erro(f"{oid}: id duplicado")
        ids.add(oid)
        if o.get("esfera") not in ESFERAS:
            erro(f"{oid}: esfera inválida ({o.get('esfera')})")
        if o.get("tipo") not in TIPOS:
            erro(f"{oid}: tipo inválido ({o.get('tipo')})")
        if not o.get("titulo") or not o.get("descricao"):
            erro(f"{oid}: título/descrição vazios")
        if "status" in o:
            erro(f"{oid}: remova o campo 'status' (o status vem do último item do histórico)")
        ind = o.get("indicador")
        if ind and not all(k in ind for k in ("unidade", "base", "meta")):
            erro(f"{oid}: indicador precisa de unidade, base e meta")

        hist = o.get("historico") or []
        if not hist:
            erro(f"{oid}: histórico vazio")
        datas = [h.get("data", "") for h in hist]
        if datas != sorted(datas):
            avisos.append(f"{oid}: histórico fora de ordem cronológica (o app ordena, mas confira)")
        for h in hist:
            d = h.get("data", "")
            if not DATA.match(d):
                erro(f"{oid}: data inválida '{d}'")
            ultima_data_global = max(ultima_data_global, d)
            st = h.get("status")
            if st not in STATUS:
                erro(f"{oid}: status inválido '{st}' em {d}")
            if not h.get("resumo"):
                erro(f"{oid}: resumo vazio em {d}")
            fontes = h.get("fontes") or []
            if st != "nao_avaliado" and not fontes:
                erro(f"{oid}: status '{st}' em {d} sem nenhuma fonte")
            for f in fontes:
                if not f.get("titulo") or not f.get("url"):
                    erro(f"{oid}: fonte sem título/url em {d}")
                elif not (f["url"].startswith("https://") or f["url"].startswith("src/")):
                    erro(f"{oid}: url deve começar com https:// (ou src/ para o PDF do plano): {f['url']}")
            if ind and h.get("valor") is not None and not isinstance(h["valor"], (int, float)):
                erro(f"{oid}: 'valor' deve ser número em {d}")

    if ultima_data_global and doc.get("atualizado_em", "") < ultima_data_global:
        erro(f"atualizado_em ({doc.get('atualizado_em')}) é anterior à última apuração ({ultima_data_global})")

    for a in avisos:
        print("AVISO:", a)
    for e in erros:
        print("ERRO:", e)
    if erros:
        print(f"\n{len(erros)} erro(s).")
        return 1
    print(f"OK: {len(ids)} objetivos válidos.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
