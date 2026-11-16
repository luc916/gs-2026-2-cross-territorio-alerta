import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { consultarTempo } from '../src/api.ts';

const fetchOriginal = globalThis.fetch;
afterEach(() => { globalThis.fetch = fetchOriginal; });

test('consulta soma os seis acumulados horários e envia as coordenadas', async () => {
  let urlConsultada = '';
  globalThis.fetch = async (url) => {
    urlConsultada = String(url);
    return new Response(JSON.stringify({ hourly: { precipitation: [1,2,3,4,5,6] }, hourly_units: { precipitation: 'mm' } }), { status: 200 });
  };
  const resultado = await consultarTempo(-23.55, -46.63);
  assert.equal(resultado.total, 21);
  assert.equal(resultado.latitude, -23.55);
  assert.match(urlConsultada, /forecast_hours=6/);
});
test('falha de rede produz mensagem compreensível', async () => {
  globalThis.fetch = async () => { throw new TypeError('Failed to fetch'); };
  await assert.rejects(consultarTempo(-23.55, -46.63), /Verifique a internet/);
});
test('erro HTTP não se transforma em previsão de zero', async () => {
  globalThis.fetch = async () => new Response('', { status: 503 });
  await assert.rejects(consultarTempo(-23.55, -46.63), /HTTP 503/);
});
test('hora sem dado não entra como zero no acumulado', async () => {
  globalThis.fetch = async () => new Response(JSON.stringify({ hourly: { precipitation: [1,2,null,4,5,6] }, hourly_units: { precipitation: 'mm' } }));
  await assert.rejects(consultarTempo(-23.55, -46.63), /previsão incompleta/);
});
