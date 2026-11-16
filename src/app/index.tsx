import { Text, View } from 'react-native';
import { Link } from 'expo-router';
import { useTerritorio } from '../context/TerritorioContext';
import { avaliar, IDS, prever, SENSORES } from '../domain';
import { Aviso, Botao, Cartao, Tela, Texto, Titulo, s } from '../components/UI';
import { Grafico } from '../components/Grafico';

export default function Painel() {
  const { estado, agora, atualizarTempo, consultando, erroApi } = useTerritorio();
  const alertas = IDS.map(id => avaliar(id, estado, agora)).filter(Boolean);
  const tempo = estado.tempo;
  const desatualizado = tempo && agora - tempo.consultadoEm > 6 * 3600000;
  return <Tela titulo="Um olhar para o bairro." subtitulo={estado.config.regiao}>
    <Aviso texto="DEMONSTRAÇÃO: sensores simulados e registros manuais de teste. Não representam condições reais do território." />
    <Cartao><Text style={s.etiqueta}>MONITORAMENTO TERRITORIAL</Text><Text style={s.valor}>{alertas.length} sinais de atenção</Text><Texto>Confira os motivos e planeje uma verificação do local. Nenhuma ação é executada automaticamente.</Texto><Link href="/alertas" style={{ color: '#17634F', paddingVertical: 14, fontWeight: '700' }}>Consultar alertas →</Link></Cartao>
    {IDS.map(id => {
      const sensor = SENSORES[id]; const p = prever(estado.series[id], agora); const alerta = avaliar(id, estado, agora);
      return <Cartao key={id}><View style={s.linha}><Titulo>{sensor.nome}</Titulo><Text style={s.etiqueta}>{alerta?.nivel ?? (p.valor === null ? 'SEM PREVISÃO' : 'ABAIXO DO LIMIAR')}</Text></View>
        <Text style={s.valor}>{p.valor === null ? '—' : p.valor.toFixed(1)} <Text style={{ fontSize: 16 }}>{sensor.unidade}</Text></Text>
        <Texto>{p.motivo}</Texto><Grafico leituras={estado.series[id]} unidade={sensor.unidade} />
      </Cartao>;
    })}
    <Cartao><Text style={s.etiqueta}>FONTE PÚBLICA / OPEN-METEO</Text><Titulo>Precipitação nas próximas 6 horas</Titulo>
      {tempo ? <><Text style={s.valor}>{tempo.total.toFixed(1)} mm</Text><Texto>Previsão meteorológica consultada em {new Date(tempo.consultadoEm).toLocaleString('pt-BR')} para {tempo.latitude}, {tempo.longitude}.</Texto>{desatualizado ? <Aviso texto="Cache com mais de 6 horas: atualize antes de interpretar." erro /> : null}</> : <Texto>Consulte a previsão pública para as coordenadas do território. É preciso ter conexão com a internet.</Texto>}
      <Texto>Esta fonte é exibida separadamente dos sensores de demonstração. Não alimenta os alertas locais nem indica risco de alagamento sozinha.</Texto>
      {erroApi ? <Aviso texto={`${erroApi} ${tempo ? 'Última consulta mantida com sua data original.' : 'Os dados de demonstração continuam disponíveis.'}`} erro /> : null}
      <Botao titulo={consultando ? 'Consultando…' : 'Consultar previsão pública'} disabled={consultando} onPress={() => { void atualizarTempo(); }} />
      <Link href="https://open-meteo.com/" style={{ color: '#17634F', paddingVertical: 8 }}>Dados meteorológicos por Open-Meteo.com • CC BY 4.0</Link>
    </Cartao>
  </Tela>;
}
