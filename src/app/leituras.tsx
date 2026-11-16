import { useState } from 'react';
import { Text, View } from 'react-native';
import { useTerritorio } from '../context/TerritorioContext';
import { IDS, SENSORES } from '../domain';
import type { SensorId } from '../domain';
import { Aviso, Botao, Campo, Cartao, Tela, Texto, Titulo, s } from '../components/UI';

export default function Leituras() {
  const { estado, adicionar, reiniciarDemo } = useTerritorio();
  const [id, setId] = useState<SensorId>('chuva');
  const [valor, setValor] = useState(''); const [mensagem, setMensagem] = useState(''); const [erro, setErro] = useState(false);
  const [confirmar, setConfirmar] = useState(false);
  function registrar() {
    try {
      if (!valor.trim()) throw new Error('Informe o valor da leitura.');
      adicionar(id, Number(valor.replace(',', '.'))); setValor(''); setErro(false); setMensagem('Leitura manual de teste salva. Indicadores recalculados.');
    } catch (e) { setErro(true); setMensagem(e instanceof Error ? e.message : 'Não foi possível registrar.'); }
  }
  return <Tela titulo="Cada leitura conta." subtitulo="Histórico local e entrada de dados para estudo.">
    <Cartao><Titulo>Escolha o indicador</Titulo>{IDS.map(sensor => <Botao key={sensor} titulo={`${sensor === id ? 'Selecionado: ' : ''}${SENSORES[sensor].nome}`} secundario={sensor !== id} onPress={() => { setId(sensor); setMensagem(''); setValor(''); }} />)}</Cartao>
    <Cartao><Titulo>Adicionar leitura de teste</Titulo><Campo label={`${SENSORES[id].nome} (${SENSORES[id].unidade})`} value={valor} onChangeText={setValor} numerico /><Botao titulo="Salvar leitura" onPress={registrar} />{mensagem ? <Aviso texto={mensagem} erro={erro} /> : null}<Texto>As entradas manuais também são testes. Não registre endereços, nomes ou dados pessoais.</Texto></Cartao>
    <Cartao><Titulo>Histórico • {SENSORES[id].nome}</Titulo><Texto>Últimas 20 de {estado.series[id].length} leituras locais. Retenção máxima: 120 por indicador.</Texto>
      {estado.series[id].slice(-20).reverse().map((l, i) => <View key={`${l.instante}-${i}`} style={{ borderTopWidth: 1, borderTopColor: '#D5DFDB', paddingTop: 10, gap: 4 }}><View style={s.linha}><Text style={s.etiqueta}>{l.valor.toFixed(1)} {SENSORES[id].unidade}</Text><Text style={s.etiqueta}>{l.origem}</Text></View><Texto>{new Date(l.instante).toLocaleString('pt-BR')}</Texto></View>)}
    </Cartao>
    <Cartao><Titulo>Recarregar cenário demonstrativo</Titulo><Texto>Substitui todas as leituras e reconhecimentos por um conjunto de teste atualizado. Preserva as configurações e a consulta pública.</Texto>
      <Botao titulo={confirmar ? 'Confirmar substituição das leituras' : 'Preparar nova demonstração'} secundario onPress={() => { if (!confirmar) setConfirmar(true); else { reiniciarDemo(); setConfirmar(false); setErro(false); setMensagem('Cenário demonstrativo recarregado.'); } }} />
      {confirmar ? <Botao titulo="Cancelar" secundario onPress={() => setConfirmar(false)} /> : null}
    </Cartao>
  </Tela>;
}
