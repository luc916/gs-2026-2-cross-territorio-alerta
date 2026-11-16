import { test } from 'node:test';
import assert from 'node:assert/strict';
import { criarDemonstracao, prever, avaliar } from '../src/domain.ts';

test('cinco leituras já permitem calcular a média', () => {
  const agora = 100000000;
  const estado = criarDemonstracao(agora);
  const leituras = estado.series.chuva.slice(-5);

  const resultado = prever(leituras, agora);

  assert.equal(resultado.valor, 33.6);
});

test('leitura com exatamente 24 horas ainda permite previsão', () => {
  const instante = 100000000;
  const estado = criarDemonstracao(instante);

  const resultado = prever(estado.series.chuva, instante + 24 * 60 * 60 * 1000);

  assert.equal(resultado.valor, 33.6);
});

test('média abaixo do limite de atenção não gera alerta', () => {
  const agora = 100000000;
  const estado = criarDemonstracao(agora);
  estado.series.chuva = estado.series.chuva.map(leitura => ({ ...leitura, valor: 10 }));

  const alerta = avaliar('chuva', estado, agora);

  assert.equal(alerta, null);
});
