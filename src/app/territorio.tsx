import { useState } from 'react';
import { useTerritorio } from '../context/TerritorioContext';
import { IDS, SENSORES } from '../domain';
import type { Config } from '../domain';
import { Aviso, Botao, Campo, Cartao, Tela, Texto, Titulo } from '../components/UI';

export default function Territorio() {
  const { estado, salvarConfig } = useTerritorio();
  const [regiao, setRegiao] = useState(estado.config.regiao);
  const [latitude, setLatitude] = useState(String(estado.config.latitude));
  const [longitude, setLongitude] = useState(String(estado.config.longitude));
  const [limites, setLimites] = useState(() => Object.fromEntries(IDS.map(id => [id, { atencao: String(estado.config.limites[id].atencao), alerta: String(estado.config.limites[id].alerta), critico: String(estado.config.limites[id].critico) }])));
  const [mensagem, setMensagem] = useState(''); const [erro, setErro] = useState(false);
  function numero(texto: string) { if (!texto.trim()) throw new Error('Preencha todos os campos numéricos.'); return Number(texto.replace(',', '.')); }
  function salvar() {
    try {
      const config: Config = { regiao: regiao.trim(), latitude: numero(latitude), longitude: numero(longitude), limites: Object.fromEntries(IDS.map(id => [id, { atencao: numero(limites[id].atencao), alerta: numero(limites[id].alerta), critico: numero(limites[id].critico) }])) as Config['limites'] };
      salvarConfig(config); setErro(false); setMensagem('Configurações aplicadas. Indicadores recalculados.');
    } catch (e) { setErro(true); setMensagem(e instanceof Error ? e.message : 'Configuração inválida.'); }
  }
  return <Tela titulo="O território em foco." subtitulo="Parâmetros transparentes, sem dados de pessoas.">
    <Aviso texto="Limiares são exemplos acadêmicos, sem calibração hidrológica. Coordenadas representam a região de consulta, nunca a localização pessoal do usuário." />
    <Cartao><Titulo>Região e fonte pública</Titulo><Campo label="Nome da região" value={regiao} onChangeText={setRegiao} /><Campo label="Latitude da região" value={latitude} onChangeText={setLatitude} numerico /><Campo label="Longitude da região" value={longitude} onChangeText={setLongitude} numerico /><Texto>Coordenadas iniciais: ponto ilustrativo na região de São Paulo. Somente as coordenadas são enviadas à Open-Meteo quando você consulta a previsão.</Texto></Cartao>
    {IDS.map(id => <Cartao key={id}>
      <Titulo>{SENSORES[id].nome} • {SENSORES[id].unidade}</Titulo>
      {(['atencao', 'alerta', 'critico'] as const).map(nivel => {
        const nomeNivel = { atencao: 'Atenção', alerta: 'Alerta', critico: 'Crítico' }[nivel];
        return <Campo key={nivel} label={nomeNivel}
          rotuloAcessivel={`${SENSORES[id].nome}: ${nomeNivel} em ${SENSORES[id].unidade}`}
          value={limites[id][nivel]} numerico
          onChangeText={valor => setLimites(l => ({ ...l, [id]: { ...l[id], [nivel]: valor } }))} />;
      })}
    </Cartao>)}
    {mensagem ? <Aviso texto={mensagem} erro={erro} /> : null}<Botao titulo="Salvar configurações" onPress={salvar} />
    <Cartao><Titulo>Privacidade e limites</Titulo><Texto>Não pedimos login, CPF, endereço nem permissão de localização. Leituras, configurações, reconhecimentos e cache ficam no armazenamento local deste dispositivo. Esse armazenamento não é criptografado e não deve receber informação pessoal ou sigilosa.</Texto><Texto>A consulta pública depende de internet e pode falhar. O cache mostra sua data. Os alertas são recalculados a partir dos dados locais; não há envio de notificações em segundo plano nem acionamento automático de decisões.</Texto></Cartao>
  </Tela>;
}
