import type { TempoPublico } from './domain';

export async function consultarTempo(latitude: number, longitude: number): Promise<TempoPublico> {
  const controle = new AbortController();
  const timeout = setTimeout(() => controle.abort(), 12000);
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=precipitation&forecast_hours=6&timeformat=unixtime&timezone=GMT`;
    const resposta = await fetch(url, { signal: controle.signal });
    if (!resposta.ok) throw new Error(`Open-Meteo indisponível (HTTP ${resposta.status}).`);
    const dados = await resposta.json();
    const valores: unknown = dados.hourly?.precipitation;
    if (!Array.isArray(valores) || valores.length !== 6 || !valores.every(v => typeof v === 'number' && Number.isFinite(v) && v >= 0) || dados.hourly_units?.precipitation !== 'mm')
      throw new Error('A API retornou uma previsão incompleta. Tente novamente.');
    return { total: valores.reduce((s: number, v: number) => s + v, 0), consultadoEm: Date.now(), latitude, longitude };
  } catch (erro) {
    if (controle.signal.aborted) throw new Error('A consulta demorou mais de 12 segundos. Verifique a conexão e tente novamente.');
    if (erro instanceof TypeError) throw new Error('Não foi possível conectar à Open-Meteo. Verifique a internet e tente novamente.');
    throw erro;
  } finally { clearTimeout(timeout); }
}
