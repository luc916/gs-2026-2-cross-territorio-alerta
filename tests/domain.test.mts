import { test } from 'node:test';
import assert from 'node:assert/strict';
import { criarDemonstracao, prever, avaliar, validarConfig, validarLeitura, lerEstado } from '../src/domain.ts';

test('média usa as últimas cinco leituras', () => {
  const dados = criarDemonstracao(100000000);
  assert.equal(prever(dados.series.chuva, 100000000).valor, 33.6);
});
test('sem cinco leituras não emite previsão', () => {
  assert.equal(prever(criarDemonstracao().series.chuva.slice(0,4)).valor, null);
});
test('histórico velho suspende previsão', () => {
  const e = criarDemonstracao(100000000);
  assert.equal(prever(e.series.chuva, 100000000 + 86400001).valor, null);
});
test('limiar exato já gera alerta e motivo', () => {
  const e = criarDemonstracao();
  e.series.chuva = e.series.chuva.map(l => ({ ...l, valor: 50 }));
  const alerta = avaliar('chuva', e);
  assert.equal(alerta?.nivel, 'CRÍTICO');
  assert.equal(alerta?.limite, 50);
  assert.match(alerta?.motivo ?? '', /50.0/);
});
test('valores inválidos são rejeitados', () => {
  assert.throws(() => validarLeitura('solo', 101));
  assert.throws(() => validarLeitura('chuva', NaN));
  const e = criarDemonstracao(); e.config.latitude = 91;
  assert.throws(() => validarConfig(e.config));
});
test('limiares invertidos são rejeitados', () => {
  const e = criarDemonstracao(); e.config.limites.chuva.atencao = 60;
  assert.throws(() => validarConfig(e.config));
});
test('estado persiste com reconhecimentos e configuração', () => {
  const e = criarDemonstracao(); e.config.regiao = 'Teste'; e.reconhecidos = ['alerta-1'];
  assert.deepEqual(lerEstado(JSON.stringify(e)), e);
});
