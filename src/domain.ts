export type SensorId = 'chuva' | 'rio' | 'solo';
export type Limites = { atencao: number; alerta: number; critico: number };
export type Config = {
  regiao: string; latitude: number; longitude: number;
  limites: Record<SensorId, Limites>;
};
export type Leitura = { valor: number; instante: number; origem: 'SIMULADO' | 'MANUAL' };
export type Series = Record<SensorId, Leitura[]>;
export type TempoPublico = { total: number; consultadoEm: number; latitude: number; longitude: number };
export type Estado = { versao: 1; config: Config; series: Series; reconhecidos: string[]; tempo: TempoPublico | null };
export const SENSORES: Record<SensorId, { nome: string; unidade: string; max: number; sigla: string }> = {
  chuva: { nome: 'Chuva', unidade: 'mm/h', max: 300, sigla: 'CH' },
  rio: { nome: 'Nível do rio', unidade: 'cm', max: 1000, sigla: 'NR' },
  solo: { nome: 'Saturação do solo', unidade: '%', max: 100, sigla: 'SS' },
};
export const IDS: SensorId[] = ['chuva', 'rio', 'solo'];
export const CONFIG_INICIAL: Config = {
  regiao: 'Bairro demonstrativo', latitude: -23.55, longitude: -46.63,
  limites: { chuva: { atencao: 15, alerta: 30, critico: 50 }, rio: { atencao: 80, alerta: 120, critico: 180 }, solo: { atencao: 70, alerta: 85, critico: 95 } },
};
export function validarConfig(c: Config) {
  if (!c || typeof c.regiao !== 'string' || !c.regiao.trim() || c.regiao.trim().length > 60) throw new Error('Informe uma região com 1 a 60 caracteres.');
  if (!Number.isFinite(c.latitude) || Math.abs(c.latitude) > 90) throw new Error('Latitude deve estar entre -90 e 90.');
  if (!Number.isFinite(c.longitude) || Math.abs(c.longitude) > 180) throw new Error('Longitude deve estar entre -180 e 180.');
  for (const id of IDS) {
    const l = c.limites?.[id];
    if (!l || ![l.atencao, l.alerta, l.critico].every(Number.isFinite) || l.atencao <= 0 || l.alerta <= l.atencao || l.critico <= l.alerta || l.critico > SENSORES[id].max)
      throw new Error(`${SENSORES[id].nome}: use 0 < atenção < alerta < crítico, até ${SENSORES[id].max}.`);
  }
}
export function validarLeitura(id: SensorId, valor: number) {
  if (!Number.isFinite(valor) || valor < 0 || valor > SENSORES[id].max) throw new Error(`Informe um valor entre 0 e ${SENSORES[id].max} ${SENSORES[id].unidade}.`);
}
export function criarDemonstracao(agora = Date.now()): Estado {
  const valores: Record<SensorId, number[]> = {
    chuva: [3, 5, 6, 8, 10, 16, 22, 27, 31, 35, 37, 38],
    rio: [50, 55, 62, 65, 70, 84, 95, 109, 122, 132, 140, 144],
    solo: [48, 49, 53, 57, 61, 66, 72, 78, 81, 85, 87, 88],
  };
  const series = {} as Series;
  for (const id of IDS) series[id] = valores[id].map((valor, i) => ({ valor, instante: agora - (11 - i) * 3600000, origem: 'SIMULADO' }));
  const config = { ...CONFIG_INICIAL, limites: { chuva: { ...CONFIG_INICIAL.limites.chuva }, rio: { ...CONFIG_INICIAL.limites.rio }, solo: { ...CONFIG_INICIAL.limites.solo } } };
  return { versao: 1, config, series, reconhecidos: [], tempo: null };
}
export function prever(leituras: Leitura[], agora = Date.now()) {
  if (leituras.length < 5) return { valor: null, motivo: 'São necessárias pelo menos 5 leituras.' };
  if (agora - leituras[leituras.length - 1].instante > 86400000) return { valor: null, motivo: 'Leituras desatualizadas há mais de 24 horas. Atualize a demonstração.' };
  const janela = leituras.slice(-5);
  const valor = janela.reduce((soma, l) => soma + l.valor, 0) / janela.length;
  return { valor, motivo: 'Média das últimas 5 leituras. Estimativa didática do próximo bloco, sem horizonte temporal validado.' };
}
export function avaliar(id: SensorId, estado: Estado, agora = Date.now()) {
  const p = prever(estado.series[id], agora);
  if (p.valor === null) return null;
  const limites = estado.config.limites[id];
  const nivel = p.valor >= limites.critico ? 'CRÍTICO' : p.valor >= limites.alerta ? 'ALERTA' : p.valor >= limites.atencao ? 'ATENÇÃO' : null;
  if (!nivel) return null;
  const limite = nivel === 'CRÍTICO' ? limites.critico : nivel === 'ALERTA' ? limites.alerta : limites.atencao;
  return {
    id: `${id}-${estado.series[id].at(-1)!.instante}-${limite}-${nivel}`,
    sensor: id, nivel, previsto: p.valor, limite,
    motivo: `${SENSORES[id].nome}: média prevista de ${p.valor.toFixed(1)} ${SENSORES[id].unidade} atingiu o limite de ${limite} ${SENSORES[id].unidade}.`,
  };
}
export function lerEstado(texto: string): Estado {
  const e = JSON.parse(texto) as Estado;
  if (e.versao !== 1) throw new Error('Versão dos dados locais incompatível.');
  validarConfig(e.config);
  if (!Array.isArray(e.reconhecidos) || e.reconhecidos.some(x => typeof x !== 'string')) throw new Error('Reconhecimentos locais inválidos.');
  for (const id of IDS) {
    if (!Array.isArray(e.series?.[id]) || e.series[id].length > 120) throw new Error('Histórico local inválido.');
    for (const l of e.series[id]) {
      validarLeitura(id, l.valor);
      if (!Number.isFinite(l.instante) || !['SIMULADO', 'MANUAL'].includes(l.origem)) throw new Error('Leitura local inválida.');
    }
  }
  if (e.tempo && (![e.tempo.total,e.tempo.consultadoEm,e.tempo.latitude,e.tempo.longitude].every(Number.isFinite) || e.tempo.total < 0)) throw new Error('Cache meteorológico inválido.');
  return e;
}
