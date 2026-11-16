# Território Alerta — Cross-Platform

App React Native com Expo para apoiar a observação de sinais associados a alagamentos. O gestor consulta indicadores, entende alertas e registra sua leitura; nenhuma medida de alto impacto é executada pelo app. O projeto funciona de forma independente do Java e do ESP32.

## Integrantes

| Nome completo | RM |
| --- | --- |
| Lucas Kenzo Nishiwaki | 561325 |
| Felipe Hui Hattori | 565169 |
| Kauany Ribeiro de Moura | 564576 |

## Rodar

Requisitos: Node.js 24 LTS e npm, internet para instalar pacotes. O projeto usa Expo SDK 58, correspondente à versão do Expo Go informada pelo iPhone usado no teste em 16/11/2026; o `package-lock.json` fixa as versões. Não instalar o antigo `expo-cli` global.

```sh
npm ci
npm start
```

No iPhone, instalar Expo Go e manter computador e celular no mesmo Wi-Fi. Rodar `npx expo start --lan` e escanear o QR code com a Câmera. O Expo Go do aparelho deve suportar SDK 58. Se for solicitado login, entrar com a mesma conta Expo no computador e no aparelho. Não atualizar o SDK isoladamente. O teste no iPhone 17 Pro Max está registrado abaixo.

Para conferir também no navegador:

```sh
npm run web
```

Validações executáveis:

```sh
npm run typecheck
npm run lint
npm test
npx expo export --platform web
```

Os testes usam o suporte a TypeScript do Node 24.

## Telas e requisitos

| Tela ou recurso | O que demonstra |
| --- | --- |
| Painel | Indicadores, três gráficos de barras, médias e consulta à API pública |
| Alertas | Justificativa, nível de gravidade, confiança baixa e limitações; reconhecimento local |
| Leituras | Histórico e formulário com validação, rejeição de valores negativos/fora de faixa |
| Território | Região, coordenadas e limiares validados; privacidade |
| Expo Router | Navegação por quatro abas |
| Context API + hooks | Estado compartilhado entre telas |
| AsyncStorage | Persistência de leituras, configuração, reconhecimentos e cache |
| Componentes | `Tela`, `Cartao`, `Botao`, `Campo`, `Aviso`, `Grafico`, com estilo próprio |
| Acessibilidade | Rótulos nos campos e controles; valores textuais e leitura do gráfico por leitor de tela; mensagens de erro, botões de 48 pontos e estado sem depender só de cor |

As quatro telas, a entrada inválida/válida, a restauração após recarregar e uma consulta pública foram conferidas no navegador. O teste no iPhone está descrito a seguir.

## Teste em aparelho real

Em 16/11/2026, Lucas relatou a execução no **iPhone 17 Pro Max**, pelo Expo Go com SDK 58. A versão do iOS não foi informada.

Resultados confirmados por Lucas:
- O Painel abriu no aparelho após alinhar o SDK e entrar na mesma conta no Expo Go e no Expo CLI.
- A consulta à previsão pública retornou resultado.
- A leitura manual de chuva de 42 mm/h permaneceu salva após fechar e reabrir o projeto.

Lucas também informou a realização dos testes de navegação, validação dos formulários, reconhecimento de alertas e uso dos dados locais. O registro se baseia no relato do integrante que operou o aparelho. O teste com VoiceOver não foi confirmado.

## Fontes de dados

**Verificação de 16/11/2026:** projeto atualizado para SDK 58 após o iPhone informar incompatibilidade com SDK 54. Os 11 testes, tipos e lint foram aprovados, assim como as 20 verificações do Expo Doctor. A revisão anterior também corrigiu falhas de restauração local, mensagens da API e rótulos acessíveis. Lucas confirmou a abertura e o teste no iPhone 17 Pro Max, conforme o registro acima. O npm audit da instalação atual informa dez avisos moderados; não foram forçadas trocas incompatíveis de dependências.

**Sensores locais: sintéticos.** O cenário inicial tem 12 leituras por indicador, marcadas como SIMULADO, em intervalos demonstrativos de uma hora. Entradas do formulário são MANUAIS de teste. Não são observações ambientais reais. O app conserva até 120 registros por indicador e exibe os 20 mais recentes na tela Leituras.

**Previsão pública: Open-Meteo.** A requisição HTTPS consulta `hourly=precipitation` por seis horas para a latitude/longitude configurada, sem chave de API. O app soma os seis acumulados horários em mm. O cartão informa fonte, coordenadas, data da consulta e cache com mais de seis horas. [Dados por Open-Meteo.com](https://open-meteo.com/), licenciados em [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). [Documentação da API](https://open-meteo.com/en/docs).

Essa previsão pública fica separada dos sensores locais e não participa do cálculo dos alertas demonstrativos. Não misturamos um acumulado previsto em mm com a intensidade simulada de chuva em mm/h.

## Previsões, confiança e limites

O cálculo local é a média das últimas cinco leituras de cada sensor. Com menos de cinco leituras ou última coleta há mais de 24 horas, não há previsão. A média é uma estimativa didática do próximo bloco, sem horizonte temporal validado. Limiares iniciais são exemplos, não recomendações meteorológicas. As faixas físicas aceitas servem à validação do software e não certificam qualidade de medição.

A confiança é explicitamente **baixa**, qualitativa e sem percentual inventado. O modelo não considera relevo, drenagem, representatividade espacial, calibração nem intervalos irregulares. Ausência de alerta não significa ausência de risco. O app orienta o gestor a verificar o local e comparar informações com fontes oficiais; não determina evacuação nem dispara serviços automaticamente.

Registrar a leitura de um alerta apenas salva um reconhecimento local. Novas medições ou mudanças nos limiares podem gerar um novo identificador. Não é um sistema de chamados nem um histórico persistente de incidentes: os alertas são derivados das leituras atuais.

## Falhas e privacidade

- Timeout de 12 segundos e mensagem para falha HTTP, rede ou resposta incompleta.
- Se a consulta falhar, dados locais continuam disponíveis e o último cache mantém sua data. Se a leitura do armazenamento local falhar, o app bloqueia gravações para preservar o histórico; a substituição só é liberada ao confirmar uma nova demonstração.
- Ao mudar coordenadas, o cache da outra região é descartado; respostas antigas não substituem a consulta de uma nova configuração.
- Não usamos login, CPF, nome de morador, localização do aparelho ou analytics.
- Só as coordenadas de região configuradas são enviadas à Open-Meteo na consulta. O provedor recebe os dados técnicos normais da conexão.
- AsyncStorage não é armazenamento criptografado; não cadastrar dados pessoais ou sigilosos.
- Limpar os dados do app/navegador remove o histórico local. O botão de demonstração substitui leituras e reconhecimentos após confirmação, preservando configuração e cache.

## Estrutura

`src/app`: telas e layout das abas. `src/context`: carregamento e persistência do estado. `src/components`: componentes visuais reutilizáveis. `src/domain.ts`: cálculo e validações, sem depender da interface. `src/api.ts`: consumo de API. `tests`: testes da lógica.

## Uso de IA

A versão inicial do código, dos testes e da documentação foi gerada com assistência de IA (Codex). A validação técnica incluiu testes automatizados, análise de tipos, lint e Expo Doctor. Lucas executou o aplicativo no iPhone e confirmou os resultados registrados acima.

## Referências de implementação

- [Compatibilidade Expo Go no iPhone](https://docs.expo.dev/troubleshooting/expo-go-version-mismatch/)
- [Expo Router](https://docs.expo.dev/router/installation/)
- [AsyncStorage no Expo](https://docs.expo.dev/versions/v58.0.0/sdk/async-storage/)
