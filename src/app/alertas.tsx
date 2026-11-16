import { Text } from 'react-native';
import { useTerritorio } from '../context/TerritorioContext';
import { avaliar, IDS, SENSORES } from '../domain';
import { Aviso, Botao, Cartao, Tela, Texto, Titulo, s } from '../components/UI';

export default function Alertas() {
  const { estado, agora, reconhecer } = useTerritorio();
  const alertas = IDS.map(id => avaliar(id, estado, agora)).filter(a => a !== null);
  return <Tela titulo="Entender antes de agir." subtitulo="Alertas explicados, com limites à vista.">
    <Aviso texto="Confiança: BAIXA. Estimativa didática com dados simulados ou manuais de teste. Não é uma probabilidade estatística e não foi validada para uso real." />
    {!alertas.length ? <Cartao><Titulo>Nenhum alerta calculado</Titulo><Texto>Valores abaixo dos limiares ou histórico insuficiente/desatualizado. Isso não comprova ausência de risco.</Texto></Cartao> : null}
    {alertas.map(a => {
      const reconhecido = estado.reconhecidos.includes(a.id);
      return <Cartao key={a.id}><Text style={s.etiqueta}>{a.nivel} • DEMONSTRAÇÃO</Text><Titulo>{SENSORES[a.sensor].nome}</Titulo><Texto>{a.motivo}</Texto>
        <Texto>Método: média das últimas 5 leituras. Um ponto de coleta não representa todo o bairro; drenagem, relevo e falhas de medição não entram no cálculo.</Texto>
        <Texto>Apoio ao gestor: verificar leituras e condições locais, comparar com fontes oficiais e discutir medidas preventivas com a equipe responsável.</Texto>
        <Botao titulo={reconhecido ? 'Leitura registrada' : 'Registrar que li o alerta'} secundario disabled={reconhecido} onPress={() => reconhecer(a.id)} />
        <Texto>Registrar a leitura não resolve o risco nem aciona serviços públicos.</Texto>
      </Cartao>;
    })}
  </Tela>;
}
