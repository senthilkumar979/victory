/**
 * Java roadmap diagram. Source SVG: src/app/modules/Roadmaps/java.svg
 */

import type { RoadmapDetailsProps } from '@/data/roadmaps/types'
import { useCallback } from 'react'

export const JavaRoadmap = ({
  onNodeClick,
  completedNodes = [],
}: RoadmapDetailsProps) => {
  const isCompleted = useCallback(
    (nodeId: string) => completedNodes.includes(nodeId),
    [completedNodes],
  )

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="679 0 1097 2239"
      version="1.1"
      style={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}
      className="h-auto w-full max-w-full"
    >
      <path
        d="M1243.3343015809069,61.87585799310881 C1243.3343015809069,124.92650846563109 1243.3343015809069,124.92650846563109 1243.3343015809069,187.97715893815337"
        fill="none"
        stroke="#cea500"
        strokeWidth={3.5}
        data-edge-id="reactflow__edge-hp15XdmPlKKTbYnrYfCBlx2-Rhk7BrJqNEXQT3LGlGLM6w1"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={0}
      />
      <path
        d="M1125.8343015809069,212.47715893815337 C1036.4980862648833,212.47715893815337 1036.4980862648833,106.97715893815337 947.1618709488599,106.97715893815337"
        fill="none"
        stroke="#cea500"
        strokeWidth={3.5}
        data-edge-id="reactflow__edge-Rhk7BrJqNEXQT3LGlGLM6y2-OlbQNB6YXZjO1J7D0lZU1z1"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="0.8 8"
      />
      <path
        d="M1125.8343015809069,212.47715893815337 C1036.4980862648833,212.47715893815337 1036.4980862648833,212.47715893815337 947.1618709488599,212.47715893815337"
        fill="none"
        stroke="#cea500"
        strokeWidth={3.5}
        data-edge-id="reactflow__edge-Rhk7BrJqNEXQT3LGlGLM6y2-QgWalJLIb6Fw0HhN1wb02z1"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="0.8 8"
      />
      <path
        d="M1125.8343015809069,212.47715893815337 C1036.4980862648833,212.47715893815337 1036.4980862648833,265.47715893815337 947.1618709488599,265.47715893815337"
        fill="none"
        stroke="#cea500"
        strokeWidth={3.5}
        data-edge-id="reactflow__edge-Rhk7BrJqNEXQT3LGlGLM6y2-VBNcAO0STaZJ1iV9A7utvz1"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="0.8 8"
      />
      <path
        d="M1125.8343015809069,212.47715893815337 C1036.4980862648833,212.47715893815337 1036.4980862648833,318.47715893815337 947.1618709488599,318.47715893815337"
        fill="none"
        stroke="#cea500"
        strokeWidth={3.5}
        data-edge-id="reactflow__edge-Rhk7BrJqNEXQT3LGlGLM6y2-yNDbk6r5wFqBi25xmIRF_z1"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="0.8 8"
      />
      <path
        d="M1360.8343015809069,212.47715893815337 C1441.6840930718367,212.47715893815337 1441.6840930718367,210.88076562915717 1522.5338845627668,210.88076562915717"
        fill="none"
        stroke="#cea500"
        strokeWidth={3.5}
        data-edge-id="reactflow__edge-Rhk7BrJqNEXQT3LGlGLM6z2-5khApwg1FZ-0qorsLyH-Fy1"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="0.8 8"
      />
      <path
        d="M1360.8343015809069,212.47715893815337 C1441.6840930718367,212.47715893815337 1441.6840930718367,263.88076562915717 1522.5338845627668,263.88076562915717"
        fill="none"
        stroke="#cea500"
        strokeWidth={3.5}
        data-edge-id="reactflow__edge-Rhk7BrJqNEXQT3LGlGLM6z2-sG_3ZQIE1-FQXQkk-OduQy1"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="0.8 8"
      />
      <path
        d="M1360.8343015809069,212.47715893815337 C1441.6840930718367,212.47715893815337 1441.6840930718367,316.88076562915717 1522.5338845627668,316.88076562915717"
        fill="none"
        stroke="#cea500"
        strokeWidth={3.5}
        data-edge-id="reactflow__edge-Rhk7BrJqNEXQT3LGlGLM6z2-DZ4BX4NYeCQbjGSj56lngy1"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="0.8 8"
      />
      <path
        d="M1360.8343015809069,212.47715893815337 C1441.6840930718367,212.47715893815337 1441.6840930718367,157.88076562915717 1522.5338845627668,157.88076562915717"
        fill="none"
        stroke="#cea500"
        strokeWidth={3.5}
        data-edge-id="reactflow__edge-2TGq1y2QthnxxN-FfToSez2-ziD_XwzJSFQP_3iLjq9pAy1"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="0.8 8"
      />
      <path
        d="M1360.8343015809069,212.47715893815337 C1441.6840930718367,212.47715893815337 1441.6840930718367,104.88076562915717 1522.5338845627668,104.88076562915717"
        fill="none"
        stroke="#cea500"
        strokeWidth={3.5}
        data-edge-id="reactflow__edge-2TGq1y2QthnxxN-FfToSez2-aEaBobzFWv0mJHGAbgxKYy1"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="0.8 8"
      />
      <path
        d="M1125.8343015809069,212.47715893815337 C1036.4980862648833,212.47715893815337 1036.4980862648833,159.47715893815337 947.1618709488599,159.47715893815337"
        fill="none"
        stroke="#cea500"
        strokeWidth={3.5}
        data-edge-id="reactflow__edge-2TGq1y2QthnxxN-FfToSey2-QgWalJLIb6Fw0HhN1wb02z1"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="0.8 8"
      />
      <path
        d="M1360.8343015809069,212.47715893815337 C1441.6840930718367,212.47715893815337 1441.6840930718367,369.88076562915717 1522.5338845627668,369.88076562915717"
        fill="none"
        stroke="#cea500"
        strokeWidth={3.5}
        data-edge-id="reactflow__edge-2TGq1y2QthnxxN-FfToSez2-DZ4BX4NYeCQbjGSj56lngy1"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="0.8 8"
      />
      <path
        d="M1243.3343015809069,236.97715893815337 C1243.3343015809069,326.6625274388637 1243.5552405844742,326.6625274388637 1243.5552405844742,416.3478959395741"
        fill="none"
        stroke="#cea500"
        strokeWidth={3.5}
        data-edge-id="reactflow__edge-2TGq1y2QthnxxN-FfToSex2-zNHDLv26Xn3oMrDVSAP1Zw2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={0}
      />
      <path
        d="M1243.5552405844742,468.3478959395741 C1243.5552405844742,496.178200090661 1243.5552405844742,496.178200090661 1243.5552405844742,524.0085042417479"
        fill="none"
        stroke="#cea500"
        strokeWidth={3.5}
        data-edge-id="reactflow__edge-zNHDLv26Xn3oMrDVSAP1Zx2-FyTlaUqrK5h3e5mWwkvVgw1"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={0}
      />
      <path
        d="M1412.0552405844742 442.3478959395741L1432.0552405844742 442.3478959395741L 1642.5338845627668,442.3478959395741Q 1647.5338845627668,442.3478959395741 1647.5338845627668,447.3478959395741L1647.5338845627668 500.55362472503464L1647.5338845627668 520.5536247250346"
        fill="none"
        stroke="#cea500"
        strokeWidth={3.5}
        data-edge-id="reactflow__edge-zNHDLv26Xn3oMrDVSAP1Zz2-g9P3548F38tYGjevBc42ww1"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={0}
      />
      <path
        d="M1647.5338845627668,569.5536247250346 C1647.5338845627668,600.8125357473727 1647.5338845627668,600.8125357473727 1647.5338845627668,632.0714467697107"
        fill="none"
        stroke="#cea500"
        strokeWidth={3.5}
        data-edge-id="reactflow__edge-g9P3548F38tYGjevBc42wx2-00_q6I95eO-PUUrKpPFY8w1"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={0}
      />
      <path
        d="M1097.3720474064457,1502.013322952089 C1097.3720474064457,1487.1205091583613 1097.3720474064457,1487.1205091583613 1097.3720474064457,1472.2276953646335"
        fill="none"
        stroke="#cea500"
        strokeWidth={3.5}
        data-edge-id="reactflow__edge-81N1cZLue_Ii0uD5CV6kZw2-6FMj9tMAQPii_1kLtHJLkx2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="0.8 8"
      />
      <path
        d="M1647.5338845627668,990.8599244017678 C1647.5338845627668,1050.0901381737422 1647.5338845627668,1050.0901381737422 1647.5338845627668,1109.3203519457165"
        fill="none"
        stroke="#cea500"
        strokeWidth={3.5}
        data-edge-id="reactflow__edge-zItXmuluDtl6HkTYQ7qMhx2-M0ybgK1JCycXhZ1dEpCFow2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={0}
      />
      <path
        d="M1366.6499336025647,1501.4989519840194 C1366.6499336025647,1485.8791876857574 1366.6499336025647,1485.8791876857574 1366.6499336025647,1470.2594233874954"
        fill="none"
        stroke="#cea500"
        strokeWidth={3.5}
        data-edge-id="reactflow__edge-LgpsnXV0CTvTspjnsd0Rdw2-kN-mXxqUPNJNsJGQ0U_7Jx1"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="0.8 8"
      />
      <path
        d="M1250.6499336025647,1525.9989519840194 C1219.2609905045051,1525.9989519840194 1219.2609905045051,1526.513322952089 1187.8720474064457,1526.513322952089"
        fill="none"
        stroke="#cea500"
        strokeWidth={3.5}
        data-edge-id="reactflow__edge-LgpsnXV0CTvTspjnsd0Rdy2-81N1cZLue_Ii0uD5CV6kZz2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={0}
      />
      <path
        d="M1082.8343015809069,1162.3203519457165 C1082.8343015809069,1142.4214268586184 1082.8343015809069,1142.4214268586184 1082.8343015809069,1122.5225017715202"
        fill="none"
        stroke="#cea500"
        strokeWidth={3.5}
        data-edge-id="reactflow__edge-JeMG0gU8IVRBZgczjXmPiw2-u_YysD7Bpnq-xkFX5yJGzx1"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="0.8 8"
      />
      <path
        d="M1482.6499336025647,1525.9989519840194 C1505.8419090826658,1525.9989519840194 1505.8419090826658,1524.8599244017678 1529.0338845627668,1524.8599244017678"
        fill="none"
        stroke="#cea500"
        strokeWidth={3.5}
        data-edge-id="reactflow__edge-_W84u4UXMSY0zvy6RJvFiz2-LgpsnXV0CTvTspjnsd0Rdy1"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={0}
      />
      <path
        d="M1639.5338845627668,1500.3599244017678 C1639.5338845627668,1483.6034343545502 1639.5338845627668,1483.6034343545502 1639.5338845627668,1466.8469443073327"
        fill="none"
        stroke="#cea500"
        strokeWidth={3.5}
        data-edge-id="reactflow__edge-LgpsnXV0CTvTspjnsd0Rdw2-WzWOxBUKKg6LeuBmVesc2x1"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="0.8 8"
      />
      <path
        d="M1639.5338845627668,1549.3599244017678 C1639.5338845627668,1585.8397894804837 1639.5338845627668,1585.8397894804837 1639.5338845627668,1622.3196545591995"
        fill="none"
        stroke="#cea500"
        strokeWidth={3.5}
        data-edge-id="reactflow__edge-fV-gW51jhna2__Ln2HIIhx2-LgpsnXV0CTvTspjnsd0Rdw1"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={0}
      />
      <path
        d="M1529.0338845627668,1646.8196545591995 C1529.0338845627668,1646.8196545591995 1529.0338845627668,1646.8196545591995 1529.0338845627668,1646.8196545591995"
        fill="none"
        stroke="#cea500"
        strokeWidth={3.5}
        data-edge-id="reactflow__edge-d9F5Wt8onY125DLuzNULgy2-d9F5Wt8onY125DLuzNULgy1"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={0}
      />
      <path
        d="M1529.0338845627668,1646.8196545591995 C1490.6362182737944,1646.8196545591995 1490.6362182737944,1646.8196545591995 1452.2385519848222,1646.8196545591995"
        fill="none"
        stroke="#cea500"
        strokeWidth={3.5}
        data-edge-id="xy-edge__d9F5Wt8onY125DLuzNULgy2-vRZAtylN3zfHIv3SidYkAz2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={0}
      />
      <path
        d="M1371.2385519848222,1671.3196545591995 C1371.2385519848222,1711.6678011770427 1371.2385519848222,1711.6678011770427 1371.2385519848222,1752.015947794886"
        fill="none"
        stroke="#cea500"
        strokeWidth={3.5}
        data-edge-id="xy-edge__vRZAtylN3zfHIv3SidYkAx2-LgpsnXV0CTvTspjnsd0Rdw2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={0}
      />
      <path
        d="M1290.2385519848222,1646.8196545591995 C1253.7818766801056,1646.8196545591995 1253.7818766801056,1646.8196545591995 1217.3252013753893,1646.8196545591995"
        fill="none"
        stroke="#cea500"
        strokeWidth={3.5}
        data-edge-id="xy-edge__vRZAtylN3zfHIv3SidYkAy2-d3Tsc7KPhtjS0eC4Zbq8Bz2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="0.8 8"
      />
      <g data-node-id="CdLumO1g7RNbOkwUFkVC3" data-type="horizontal">
        <line
          x1={1223.8343015809069}
          y1={1780.9390443834811}
          x2={1301.8343015809069}
          y2={1780.9390443834811}
          style={{
            strokeLinecap: 'round',
            strokeWidth: 3.65,
            stroke: '#cea500',
            strokeDasharray: '0.8 8',
          }}
        />
      </g>
      <g data-node-id="VheIOU0XKrEw_5M-Wv4yv" data-type="section">
        <rect
          x={1023.6752013753893}
          y={1691.3659477948859}
          width={212.3}
          height={165.3}
          rx={5}
          fill="#ffffff"
          stroke="#000000"
          strokeWidth={2.7}
        />
        <text
          x={1022.3252013753893}
          y={1682.015947794886}
          textAnchor="start"
          dominantBaseline="auto"
          fontSize={14}
          fill="black"
        >
          <tspan></tspan>
        </text>
      </g>
      <g data-node-id="8Ej86dM3j55V5r29WHTef" data-type="section">
        <rect
          x={841.2429054677501}
          y={1690.9240097760007}
          width={184.3}
          height={165.3}
          rx={5}
          fill="#ffffff"
          stroke="#000000"
          strokeWidth={2.7}
        />
        <text
          x={839.8929054677501}
          y={1681.5740097760008}
          textAnchor="start"
          dominantBaseline="auto"
          fontSize={14}
          fill="black"
        >
          <tspan></tspan>
        </text>
      </g>
      <g data-node-id="phhoZcCGuVm_zYFfcArb8" data-type="section">
        <rect
          x={700.832369832682}
          y={1689.789044383481}
          width={143.3}
          height={166.3}
          rx={5}
          fill="#ffffff"
          stroke="#000000"
          strokeWidth={2.7}
        />
        <text
          x={699.482369832682}
          y={1680.4390443834811}
          textAnchor="start"
          dominantBaseline="auto"
          fontSize={14}
          fill="black"
        >
          <tspan></tspan>
        </text>
      </g>
      <g data-node-id="iv_f10rCHm21sz5hesZxj" data-type="vertical">
        <line
          x1={1698.7217949048954}
          y1={1645.8131791964786}
          x2={1698.7217949048954}
          y2={1749.8131791964786}
          style={{
            strokeLinecap: 'round',
            strokeWidth: 3.65,
            stroke: '#cea500',
            strokeDasharray: '0.8 8',
          }}
        />
      </g>
      <g data-node-id="l40LZhtS-ldRtJ2cgiiXc" data-type="vertical">
        <line
          x1={1588.0469679422956}
          y1={1649.8131791964786}
          x2={1588.0469679422956}
          y2={1749.8131791964786}
          style={{
            strokeLinecap: 'round',
            strokeWidth: 3.65,
            stroke: '#cea500',
            strokeDasharray: '0.8 8',
          }}
        />
      </g>
      <g data-node-id="7HWfRgtCU9Dv2N_3oHwYe" data-type="horizontal">
        <line
          x1={945.0073106597292}
          y1={1525.8599244017678}
          x2={1041.0073106597292}
          y2={1525.8599244017678}
          style={{
            strokeLinecap: 'round',
            strokeWidth: 3.65,
            stroke: '#cea500',
            strokeDasharray: 0,
          }}
        />
      </g>
      <g data-node-id="BUES6hALwmHMS0oAKPKz0" data-type="vertical">
        <line
          x1={793.0073106597292}
          y1={1116.3203519457165}
          x2={793.0073106597292}
          y2={1282.3203519457165}
          style={{
            strokeLinecap: 'round',
            strokeWidth: 3.6,
            stroke: '#cea500',
            strokeDasharray: 0,
          }}
        />
      </g>
      <g data-node-id="pbxsWeOonIRXRxPpdV-zo" data-type="horizontal">
        <line
          x1={818.6618709488598}
          y1={1188.2990031143668}
          x2={988.6618709488598}
          y2={1188.2990031143668}
          style={{
            strokeLinecap: 'round',
            strokeWidth: 3.6,
            stroke: '#cea500',
            strokeDasharray: 0,
          }}
        />
      </g>
      <g data-node-id="myugQ4WCRi1GGRZJ8uu5k" data-type="vertical">
        <line
          x1={819.1618709488598}
          y1={1115.3203519457165}
          x2={819.1618709488598}
          y2={1190.3203519457165}
          style={{
            strokeLinecap: 'round',
            strokeWidth: 3.6,
            stroke: '#cea500',
            strokeDasharray: 0,
          }}
        />
      </g>
      <g data-node-id="ofYL6wlERXJaXuKL075zY" data-type="section">
        <rect
          x={704.3573106597293}
          y={1282.2099244017677}
          width={240.3}
          height={267.3}
          rx={5}
          fill="#ffffff"
          stroke="#000000"
          strokeWidth={2.7}
        />
        <text
          x={703.0073106597292}
          y={1272.8599244017678}
          textAnchor="start"
          dominantBaseline="auto"
          fontSize={14}
          fill="black"
        >
          <tspan></tspan>
        </text>
      </g>
      <g data-node-id="FY6qOOwg_pdFKoYPVOeys" data-type="horizontal">
        <line
          x1={1478.3696984675892}
          y1={1186.8203519457165}
          x2={1543.3696984675892}
          y2={1186.8203519457165}
          style={{
            strokeLinecap: 'round',
            strokeWidth: 3.65,
            stroke: '#cea500',
            strokeDasharray: 0,
          }}
        />
      </g>
      <g data-node-id="ekkBrbM8BtpMu3TpHadYb" data-type="section">
        <rect
          x={1252.9468056892608}
          y={891.038197690446}
          width={226.3}
          height={319.3}
          rx={5}
          fill="#ffffff"
          stroke="#000000"
          strokeWidth={2.7}
        />
        <text
          x={1251.596805689261}
          y={881.688197690446}
          textAnchor="start"
          dominantBaseline="auto"
          fontSize={17}
          fill="black"
        >
          <tspan></tspan>
        </text>
      </g>
      <g
        data-node-id="FyTlaUqrK5h3e5mWwkvVg"
        data-type="section"
        data-parent-id="zNHDLv26Xn3oMrDVSAP1Z"
      >
        <rect
          x={1019.9052405844742}
          y={525.3585042417479}
          width={447.3}
          height={313.3}
          rx={5}
          fill="#ffffff"
          stroke="#000000"
          strokeWidth={2.7}
        />
        <text
          x={1018.5552405844742}
          y={516.0085042417479}
          textAnchor="start"
          dominantBaseline="auto"
          fontSize={17}
          fill="black"
        >
          <tspan></tspan>
        </text>
      </g>
      <g data-node-id="o5yOEJFOR-wScK0GWPuQq" data-type="section">
        <rect
          x={702.8573106597293}
          y={404.6978959395741}
          width={246.3}
          height={437.3}
          rx={5}
          fill="#ffffff"
          stroke="#000000"
          strokeWidth={2.7}
        />
        <text
          x={701.5073106597292}
          y={395.3478959395741}
          textAnchor="start"
          dominantBaseline="auto"
          fontSize={14}
          fill="black"
        >
          <tspan></tspan>
        </text>
      </g>
      <g
        data-node-id="2TGq1y2QthnxxN-FfToSe"
        data-type="topic"
        data-title="Learn the Basics"
        data-parent-id="hp15XdmPlKKTbYnrYfCBl"
        data-parent-title="Java"
        onClick={() => onNodeClick('2TGq1y2QthnxxN-FfToSe')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={1127.1843015809068}
          y={189.32715893815336}
          width={232.3}
          height={46.3}
          rx={5}
          fill="#d53f8c"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={1243.3343015809069}
          y={214.62715893815337}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Learn the Basics</tspan>
        </text>
        <circle
          cx={1345.4843015809067}
          cy={212.47715893815337}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('2TGq1y2QthnxxN-FfToSe') ? 'block' : 'none'}
        />
        <path
          d="M1341.4843015809067 212.47715893815337L1343.9843015809067 215.47715893815337L1349.4843015809067 210.47715893815337"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('2TGq1y2QthnxxN-FfToSe') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="OlbQNB6YXZjO1J7D0lZU1"
        data-type="subtopic"
        data-title="Basic Syntax"
        data-parent-id="2TGq1y2QthnxxN-FfToSe"
        data-parent-title="Learn the Basics"
        onClick={() => onNodeClick('OlbQNB6YXZjO1J7D0lZU1')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={700.51187094886}
          y={83.32715893815336}
          width={245.3}
          height={47.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={823.1618709488599}
          y={109.12715893815337}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Basic Syntax</tspan>
        </text>
        <circle
          cx={931.8118709488599}
          cy={106.97715893815337}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('OlbQNB6YXZjO1J7D0lZU1') ? 'block' : 'none'}
        />
        <path
          d="M927.8118709488599 106.97715893815337L930.3118709488599 109.97715893815337L935.8118709488599 104.97715893815337"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('OlbQNB6YXZjO1J7D0lZU1') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="5g9mmi01WeZ4aDqNzwx_V"
        data-type="subtopic"
        data-title="Data Types"
        data-parent-id="2TGq1y2QthnxxN-FfToSe"
        data-parent-title="Learn the Basics"
        onClick={() => onNodeClick('5g9mmi01WeZ4aDqNzwx_V')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={700.51187094886}
          y={189.32715893815336}
          width={245.3}
          height={46.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={823.1618709488599}
          y={214.62715893815337}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Data Types</tspan>
        </text>
        <circle
          cx={931.8118709488599}
          cy={212.47715893815337}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('5g9mmi01WeZ4aDqNzwx_V') ? 'block' : 'none'}
        />
        <path
          d="M927.8118709488599 212.47715893815337L930.3118709488599 215.47715893815337L935.8118709488599 210.47715893815337"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('5g9mmi01WeZ4aDqNzwx_V') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="sG_3ZQIE1-FQXQkk-OduQ"
        data-type="subtopic"
        data-title="Conditionals"
        data-parent-id="2TGq1y2QthnxxN-FfToSe"
        data-parent-title="Learn the Basics"
        onClick={() => onNodeClick('sG_3ZQIE1-FQXQkk-OduQ')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={1523.8838845627668}
          y={240.73076562915716}
          width={231.3}
          height={46.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={1639.5338845627668}
          y={266.03076562915714}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Conditionals</tspan>
        </text>
        <circle
          cx={1741.1838845627667}
          cy={263.88076562915717}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('sG_3ZQIE1-FQXQkk-OduQ') ? 'block' : 'none'}
        />
        <path
          d="M1737.1838845627667 263.88076562915717L1739.6838845627667 266.88076562915717L1745.1838845627667 261.88076562915717"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('sG_3ZQIE1-FQXQkk-OduQ') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="5khApwg1FZ-0qorsLyH-F"
        data-type="subtopic"
        data-title="Arrays"
        data-parent-id="2TGq1y2QthnxxN-FfToSe"
        data-parent-title="Learn the Basics"
        onClick={() => onNodeClick('5khApwg1FZ-0qorsLyH-F')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={1523.8838845627668}
          y={187.73076562915716}
          width={231.3}
          height={46.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={1639.5338845627668}
          y={213.03076562915717}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Arrays</tspan>
        </text>
        <circle
          cx={1741.1838845627667}
          cy={210.88076562915717}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('5khApwg1FZ-0qorsLyH-F') ? 'block' : 'none'}
        />
        <path
          d="M1737.1838845627667 210.88076562915717L1739.6838845627667 213.88076562915717L1745.1838845627667 208.88076562915717"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('5khApwg1FZ-0qorsLyH-F') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="JHUhVEjWFXTn6-wKcKevg"
        data-type="subtopic"
        data-title="Loops"
        data-parent-id="2TGq1y2QthnxxN-FfToSe"
        data-parent-title="Learn the Basics"
        onClick={() => onNodeClick('JHUhVEjWFXTn6-wKcKevg')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={1523.8838845627668}
          y={293.7307656291572}
          width={231.3}
          height={46.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={1639.5338845627668}
          y={319.03076562915714}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Loops</tspan>
        </text>
        <circle
          cx={1741.1838845627667}
          cy={316.88076562915717}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('JHUhVEjWFXTn6-wKcKevg') ? 'block' : 'none'}
        />
        <path
          d="M1737.1838845627667 316.88076562915717L1739.6838845627667 319.88076562915717L1745.1838845627667 314.88076562915717"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('JHUhVEjWFXTn6-wKcKevg') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="VBNcAO0STaZJ1iV9A7utv"
        data-type="subtopic"
        data-title="Variables and Scopes"
        data-parent-id="2TGq1y2QthnxxN-FfToSe"
        data-parent-title="Learn the Basics"
        onClick={() => onNodeClick('VBNcAO0STaZJ1iV9A7utv')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={700.51187094886}
          y={242.32715893815336}
          width={245.3}
          height={46.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={823.1618709488599}
          y={267.62715893815334}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Variables and Scopes</tspan>
        </text>
        <circle
          cx={931.8118709488599}
          cy={265.47715893815337}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('VBNcAO0STaZJ1iV9A7utv') ? 'block' : 'none'}
        />
        <path
          d="M927.8118709488599 265.47715893815337L930.3118709488599 268.47715893815337L935.8118709488599 263.47715893815337"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('VBNcAO0STaZJ1iV9A7utv') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="yNDbk6r5wFqBi25xmIRF_"
        data-type="subtopic"
        data-title="Type Casting"
        data-parent-id="2TGq1y2QthnxxN-FfToSe"
        data-parent-title="Learn the Basics"
        onClick={() => onNodeClick('yNDbk6r5wFqBi25xmIRF_')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={700.51187094886}
          y={295.3271589381534}
          width={245.3}
          height={46.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={823.1618709488599}
          y={320.62715893815334}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Type Casting</tspan>
        </text>
        <circle
          cx={931.8118709488599}
          cy={318.47715893815337}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('yNDbk6r5wFqBi25xmIRF_') ? 'block' : 'none'}
        />
        <path
          d="M927.8118709488599 318.47715893815337L930.3118709488599 321.47715893815337L935.8118709488599 316.47715893815337"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('yNDbk6r5wFqBi25xmIRF_') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="aEaBobzFWv0mJHGAbgxKY"
        data-type="subtopic"
        data-title="Strings and Methods"
        data-parent-id="2TGq1y2QthnxxN-FfToSe"
        data-parent-title="Learn the Basics"
        onClick={() => onNodeClick('aEaBobzFWv0mJHGAbgxKY')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={1523.8838845627668}
          y={81.73076562915716}
          width={231.3}
          height={46.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={1639.5338845627668}
          y={107.03076562915717}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Strings and Methods</tspan>
        </text>
        <circle
          cx={1741.1838845627667}
          cy={104.88076562915717}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('aEaBobzFWv0mJHGAbgxKY') ? 'block' : 'none'}
        />
        <path
          d="M1737.1838845627667 104.88076562915717L1739.6838845627667 107.88076562915717L1745.1838845627667 102.88076562915717"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('aEaBobzFWv0mJHGAbgxKY') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="ziD_XwzJSFQP_3iLjq9pA"
        data-type="subtopic"
        data-title="Math Operations"
        data-parent-id="2TGq1y2QthnxxN-FfToSe"
        data-parent-title="Learn the Basics"
        onClick={() => onNodeClick('ziD_XwzJSFQP_3iLjq9pA')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={1523.8838845627668}
          y={134.73076562915716}
          width={231.3}
          height={46.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={1639.5338845627668}
          y={160.03076562915717}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Math Operations</tspan>
        </text>
        <circle
          cx={1741.1838845627667}
          cy={157.88076562915717}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('ziD_XwzJSFQP_3iLjq9pA') ? 'block' : 'none'}
        />
        <path
          d="M1737.1838845627667 157.88076562915717L1739.6838845627667 160.88076562915717L1745.1838845627667 155.88076562915717"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('ziD_XwzJSFQP_3iLjq9pA') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="QgWalJLIb6Fw0HhN1wb02"
        data-type="subtopic"
        data-title="Lifecycle of a Program"
        data-parent-id="2TGq1y2QthnxxN-FfToSe"
        data-parent-title="Learn the Basics"
        onClick={() => onNodeClick('QgWalJLIb6Fw0HhN1wb02')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={700.51187094886}
          y={136.32715893815336}
          width={245.3}
          height={46.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={823.1618709488599}
          y={161.62715893815337}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Lifecycle of a Program</tspan>
        </text>
        <circle
          cx={931.8118709488599}
          cy={159.47715893815337}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('QgWalJLIb6Fw0HhN1wb02') ? 'block' : 'none'}
        />
        <path
          d="M927.8118709488599 159.47715893815337L930.3118709488599 162.47715893815337L935.8118709488599 157.47715893815337"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('QgWalJLIb6Fw0HhN1wb02') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="LenPrQwxFsE1UVbXO_dE7"
        data-type="subtopic"
        data-title="Classes and Objects"
        onClick={() => onNodeClick('LenPrQwxFsE1UVbXO_dE7')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={713.3573106597293}
          y={463.6978959395741}
          width={227.3}
          height={46.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={827.0073106597292}
          y={488.99789593957405}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Classes and Objects</tspan>
        </text>
        <circle
          cx={926.6573106597293}
          cy={486.8478959395741}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('LenPrQwxFsE1UVbXO_dE7') ? 'block' : 'none'}
        />
        <path
          d="M922.6573106597293 486.8478959395741L925.1573106597293 489.8478959395741L930.6573106597293 484.8478959395741"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('LenPrQwxFsE1UVbXO_dE7') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="xTwJYcA6ldgaw3yGmbDEd"
        data-type="subtopic"
        data-title="Attributes and Methods"
        onClick={() => onNodeClick('xTwJYcA6ldgaw3yGmbDEd')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={713.3573106597293}
          y={516.6978959395741}
          width={227.3}
          height={46.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={827.0073106597292}
          y={541.997895939574}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Attributes and Methods</tspan>
        </text>
        <circle
          cx={926.6573106597293}
          cy={539.8478959395741}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('xTwJYcA6ldgaw3yGmbDEd') ? 'block' : 'none'}
        />
        <path
          d="M922.6573106597293 539.8478959395741L925.1573106597293 542.8478959395741L930.6573106597293 537.8478959395741"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('xTwJYcA6ldgaw3yGmbDEd') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="KYndNwfQcwRCf3zCXOwd_"
        data-type="subtopic"
        data-title="Access Specifiers"
        onClick={() => onNodeClick('KYndNwfQcwRCf3zCXOwd_')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={713.3573106597293}
          y={569.6978959395741}
          width={227.3}
          height={46.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={827.0073106597292}
          y={594.997895939574}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Access Specifiers</tspan>
        </text>
        <circle
          cx={926.6573106597293}
          cy={592.8478959395741}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('KYndNwfQcwRCf3zCXOwd_') ? 'block' : 'none'}
        />
        <path
          d="M922.6573106597293 592.8478959395741L925.1573106597293 595.8478959395741L930.6573106597293 590.8478959395741"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('KYndNwfQcwRCf3zCXOwd_') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="ZcNxO6qIXIg7RaWYnZj2e"
        data-type="subtopic"
        data-title="Static Keyword"
        onClick={() => onNodeClick('ZcNxO6qIXIg7RaWYnZj2e')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={713.3573106597293}
          y={622.6978959395741}
          width={227.3}
          height={46.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={827.0073106597292}
          y={647.997895939574}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Static Keyword</tspan>
        </text>
        <circle
          cx={926.6573106597293}
          cy={645.8478959395741}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('ZcNxO6qIXIg7RaWYnZj2e') ? 'block' : 'none'}
        />
        <path
          d="M922.6573106597293 645.8478959395741L925.1573106597293 648.8478959395741L930.6573106597293 643.8478959395741"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('ZcNxO6qIXIg7RaWYnZj2e') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="zDBW20W2XMCtNTG3emJ_A"
        data-type="subtopic"
        data-title="Nested Classes"
        onClick={() => onNodeClick('zDBW20W2XMCtNTG3emJ_A')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={713.3573106597293}
          y={727.8725969995055}
          width={227.3}
          height={46.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={827.0073106597292}
          y={753.1725969995055}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Nested Classes</tspan>
        </text>
        <circle
          cx={926.6573106597293}
          cy={751.0225969995055}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('zDBW20W2XMCtNTG3emJ_A') ? 'block' : 'none'}
        />
        <path
          d="M922.6573106597293 751.0225969995055L925.1573106597293 754.0225969995055L930.6573106597293 749.0225969995055"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('zDBW20W2XMCtNTG3emJ_A') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="DZ4BX4NYeCQbjGSj56lng"
        data-type="subtopic"
        data-title="Basics of OOP"
        data-parent-id="2TGq1y2QthnxxN-FfToSe"
        data-parent-title="Learn the Basics"
        onClick={() => onNodeClick('DZ4BX4NYeCQbjGSj56lng')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={1523.8838845627668}
          y={346.7307656291572}
          width={231.3}
          height={46.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={1639.5338845627668}
          y={372.03076562915714}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fontWeight={600}
          fill="#ffffff"
        >
          <tspan>Basics of OOP</tspan>
        </text>
        <circle
          cx={1741.1838845627667}
          cy={369.88076562915717}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('DZ4BX4NYeCQbjGSj56lng') ? 'block' : 'none'}
        />
        <path
          d="M1737.1838845627667 369.88076562915717L1739.6838845627667 372.88076562915717L1745.1838845627667 367.88076562915717"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('DZ4BX4NYeCQbjGSj56lng') ? 'block' : 'none'}
        />
      </g>
      <g data-node-id="zNHDLv26Xn3oMrDVSAP1Z" data-type="paragraph">
        <rect
          x={1076.3052405844742}
          y={417.5978959395741}
          width={337}
          height={49.5}
          rx={5}
          fill="transparent"
          stroke="transparent"
          strokeWidth={2.5}
        />
        <text fill="#d53f8c" strokeWidth={2.7}>
          <tspan
            x={1243.5552405844742}
            y={442.3478959395741}
            dy={0}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={20}
            fontWeight="bold"
          >
            Object Oriented Programming
          </tspan>
        </text>
      </g>
      <g data-node-id="ryMPhTTScI9pJMkQsZaaM" data-type="label">
        <text
          x={772.5073106597292}
          y={440.3478959395741}
          textAnchor="start"
          dominantBaseline="auto"
          fontSize={17}
          fill="black"
        >
          <tspan>Basics of OOP</tspan>
        </text>
      </g>
      <g data-node-id="X6xl98_RqAQY79baHmRRI" data-type="horizontal">
        <line
          x1={949.5073106597292}
          y1={442.3478959395741}
          x2={1089.5073106597292}
          y2={442.3478959395741}
          style={{
            strokeLinecap: 'round',
            strokeWidth: 3.65,
            stroke: '#cea500',
            strokeDasharray: 0,
          }}
        />
      </g>
      <g data-node-id="sHYmeXbdREoxrru0PZ3Px" data-type="label">
        <text
          x={1180.5552405844742}
          y={557.5536247250346}
          textAnchor="start"
          dominantBaseline="auto"
          fontSize={17}
          fill="black"
          fontWeight={600}
        >
          <tspan>More about OOP</tspan>
        </text>
      </g>
      <g
        data-node-id="Ax2ouIZgN1DpPzKDy4fwp"
        data-type="subtopic"
        data-title="Method Chaining"
        onClick={() => onNodeClick('Ax2ouIZgN1DpPzKDy4fwp')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={983.1843015809069}
          y={633.9036247250347}
          width={207.3}
          height={46.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={1086.8343015809069}
          y={659.2036247250346}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Method Chaining</tspan>
        </text>
        <circle
          cx={1176.484301580907}
          cy={657.0536247250346}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('Ax2ouIZgN1DpPzKDy4fwp') ? 'block' : 'none'}
        />
        <path
          d="M1172.484301580907 657.0536247250346L1174.984301580907 660.0536247250346L1180.484301580907 655.0536247250346"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('Ax2ouIZgN1DpPzKDy4fwp') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="ey1f8IsdAlDv1O3E_tNog"
        data-type="subtopic"
        data-title="Enums"
        onClick={() => onNodeClick('ey1f8IsdAlDv1O3E_tNog')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={983.1843015809069}
          y={686.9036247250347}
          width={98.3}
          height={46.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={1032.3343015809069}
          y={712.2036247250346}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Enums</tspan>
        </text>
        <circle
          cx={1067.484301580907}
          cy={710.0536247250346}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('ey1f8IsdAlDv1O3E_tNog') ? 'block' : 'none'}
        />
        <path
          d="M1063.484301580907 710.0536247250346L1065.984301580907 713.0536247250346L1071.484301580907 708.0536247250346"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('ey1f8IsdAlDv1O3E_tNog') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="Ajuc_rHObqMQBXLqRIuxh"
        data-type="subtopic"
        data-title="Final Keyword"
        onClick={() => onNodeClick('Ajuc_rHObqMQBXLqRIuxh')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={713.3573106597293}
          y={675.6978959395741}
          width={227.3}
          height={46.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={827.0073106597292}
          y={700.997895939574}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Final Keyword</tspan>
        </text>
        <circle
          cx={926.6573106597293}
          cy={698.8478959395741}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('Ajuc_rHObqMQBXLqRIuxh') ? 'block' : 'none'}
        />
        <path
          d="M922.6573106597293 698.8478959395741L925.1573106597293 701.8478959395741L930.6573106597293 696.8478959395741"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('Ajuc_rHObqMQBXLqRIuxh') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="3qowgj1pas1X7oRric9eU"
        data-type="subtopic"
        data-title="Object Lifecycle"
        onClick={() => onNodeClick('3qowgj1pas1X7oRric9eU')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={983.1843015809069}
          y={580.9036247250347}
          width={207.3}
          height={46.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={1086.8343015809069}
          y={606.2036247250346}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Object Lifecycle</tspan>
        </text>
        <circle
          cx={1176.484301580907}
          cy={604.0536247250346}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('3qowgj1pas1X7oRric9eU') ? 'block' : 'none'}
        />
        <path
          d="M1172.484301580907 604.0536247250346L1174.984301580907 607.0536247250346L1180.484301580907 602.0536247250346"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('3qowgj1pas1X7oRric9eU') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="qdA6bK9ZkP8p0_NH_wMuj"
        data-type="subtopic"
        data-title="Abstraction"
        onClick={() => onNodeClick('qdA6bK9ZkP8p0_NH_wMuj')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={1366.9767811847087}
          y={580.3904190441817}
          width={136.3}
          height={46.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={1435.1267811847088}
          y={605.6904190441817}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Abstraction</tspan>
        </text>
        <circle
          cx={1489.2767811847086}
          cy={603.5404190441817}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('qdA6bK9ZkP8p0_NH_wMuj') ? 'block' : 'none'}
        />
        <path
          d="M1485.2767811847086 603.5404190441817L1487.7767811847086 606.5404190441817L1493.2767811847086 601.5404190441817"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('qdA6bK9ZkP8p0_NH_wMuj') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="PXpPEmCEBUKRjwP3B5LzJ"
        data-type="subtopic"
        data-title="Inheritance"
        onClick={() => onNodeClick('PXpPEmCEBUKRjwP3B5LzJ')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={1198.9767811847087}
          y={580.9036247250347}
          width={162.3}
          height={46.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={1280.1267811847088}
          y={606.2036247250346}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Inheritance</tspan>
        </text>
        <circle
          cx={1347.2767811847086}
          cy={604.0536247250346}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('PXpPEmCEBUKRjwP3B5LzJ') ? 'block' : 'none'}
        />
        <path
          d="M1343.2767811847086 604.0536247250346L1345.7767811847086 607.0536247250346L1351.2767811847086 602.0536247250346"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('PXpPEmCEBUKRjwP3B5LzJ') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="y-i56f1P_mMdvyBr7J4XE"
        data-type="subtopic"
        data-title="Method Overloading / Overriding"
        onClick={() => onNodeClick('y-i56f1P_mMdvyBr7J4XE')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={1198.9767811847087}
          y={686.9036247250347}
          width={304.3}
          height={46.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={1351.1267811847088}
          y={712.2036247250346}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Method Overloading / Overriding</tspan>
        </text>
        <circle
          cx={1489.2767811847086}
          cy={710.0536247250346}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('y-i56f1P_mMdvyBr7J4XE') ? 'block' : 'none'}
        />
        <path
          d="M1485.2767811847086 710.0536247250346L1487.7767811847086 713.0536247250346L1493.2767811847086 708.0536247250346"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('y-i56f1P_mMdvyBr7J4XE') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="Kjdj862xnz8fqDYE3HKhC"
        data-type="subtopic"
        data-title="Static vs Dynamic Binding"
        onClick={() => onNodeClick('Kjdj862xnz8fqDYE3HKhC')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={1198.9767811847087}
          y={740.9036247250347}
          width={304.3}
          height={46.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={1351.1267811847088}
          y={766.2036247250346}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Static vs Dynamic Binding</tspan>
        </text>
        <circle
          cx={1489.2767811847086}
          cy={764.0536247250346}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('Kjdj862xnz8fqDYE3HKhC') ? 'block' : 'none'}
        />
        <path
          d="M1485.2767811847086 764.0536247250346L1487.7767811847086 767.0536247250346L1493.2767811847086 762.0536247250346"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('Kjdj862xnz8fqDYE3HKhC') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="6wTRN2PYC6zM_Txkekx53"
        data-type="subtopic"
        data-title="Interfaces"
        onClick={() => onNodeClick('6wTRN2PYC6zM_Txkekx53')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={1368.31528580563}
          y={633.9036247250347}
          width={136.3}
          height={46.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={1436.4652858056302}
          y={659.2036247250346}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Interfaces</tspan>
        </text>
        <circle
          cx={1490.61528580563}
          cy={657.0536247250346}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('6wTRN2PYC6zM_Txkekx53') ? 'block' : 'none'}
        />
        <path
          d="M1486.61528580563 657.0536247250346L1489.11528580563 660.0536247250346L1494.61528580563 655.0536247250346"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('6wTRN2PYC6zM_Txkekx53') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="iH9wSsOK4a77pS7U0Yu5z"
        data-type="subtopic"
        data-title="Encapsulation"
        onClick={() => onNodeClick('iH9wSsOK4a77pS7U0Yu5z')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={1198.9767811847087}
          y={633.9036247250347}
          width={161.3}
          height={46.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={1279.6267811847088}
          y={659.2036247250346}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Encapsulation</tspan>
        </text>
        <circle
          cx={1346.2767811847086}
          cy={657.0536247250346}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('iH9wSsOK4a77pS7U0Yu5z') ? 'block' : 'none'}
        />
        <path
          d="M1342.2767811847086 657.0536247250346L1344.7767811847086 660.0536247250346L1350.2767811847086 655.0536247250346"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('iH9wSsOK4a77pS7U0Yu5z') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="VqLV7kolfRFnvOuJAvzlg"
        data-type="subtopic"
        data-title="Record"
        onClick={() => onNodeClick('VqLV7kolfRFnvOuJAvzlg')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={1089.1843015809068}
          y={686.9036247250347}
          width={101.3}
          height={46.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={1139.8343015809069}
          y={712.2036247250346}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Record</tspan>
        </text>
        <circle
          cx={1176.4843015809067}
          cy={710.0536247250346}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('VqLV7kolfRFnvOuJAvzlg') ? 'block' : 'none'}
        />
        <path
          d="M1172.4843015809067 710.0536247250346L1174.9843015809067 713.0536247250346L1180.4843015809067 708.0536247250346"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('VqLV7kolfRFnvOuJAvzlg') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="60POZOjwHSdKYL6rfkyEy"
        data-type="subtopic"
        data-title="Packages"
        onClick={() => onNodeClick('60POZOjwHSdKYL6rfkyEy')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={713.3573106597293}
          y={781.8725969995055}
          width={227.3}
          height={46.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={827.0073106597292}
          y={807.1725969995055}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Packages</tspan>
        </text>
        <circle
          cx={926.6573106597293}
          cy={805.0225969995055}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('60POZOjwHSdKYL6rfkyEy') ? 'block' : 'none'}
        />
        <path
          d="M922.6573106597293 805.0225969995055L925.1573106597293 808.0225969995055L930.6573106597293 803.0225969995055"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('60POZOjwHSdKYL6rfkyEy') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="dg_UpaO8TzIN7w_QZ1n-6"
        data-type="subtopic"
        data-title="Initializer Block"
        onClick={() => onNodeClick('dg_UpaO8TzIN7w_QZ1n-6')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={983.1843015809069}
          y={740.9036247250347}
          width={207.3}
          height={46.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={1086.8343015809069}
          y={766.2036247250346}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Initializer Block</tspan>
        </text>
        <circle
          cx={1176.484301580907}
          cy={764.0536247250346}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('dg_UpaO8TzIN7w_QZ1n-6') ? 'block' : 'none'}
        />
        <path
          d="M1172.484301580907 764.0536247250346L1174.984301580907 767.0536247250346L1180.484301580907 762.0536247250346"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('dg_UpaO8TzIN7w_QZ1n-6') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="3r0Er9XZHovIZz3gNyj4A"
        data-type="subtopic"
        data-title="Pass by Value / Pass by Reference"
        onClick={() => onNodeClick('3r0Er9XZHovIZz3gNyj4A')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={983.1843015809069}
          y={793.7289236651033}
          width={520.3}
          height={46.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={1243.3343015809069}
          y={819.0289236651032}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Pass by Value / Pass by Reference</tspan>
        </text>
        <circle
          cx={1489.484301580907}
          cy={816.8789236651032}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('3r0Er9XZHovIZz3gNyj4A') ? 'block' : 'none'}
        />
        <path
          d="M1485.484301580907 816.8789236651032L1487.984301580907 819.8789236651032L1493.484301580907 814.8789236651032"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('3r0Er9XZHovIZz3gNyj4A') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="c--y6GcKj9am0CBdu_Hnt"
        data-type="topic"
        data-title="Annotations"
        onClick={() => onNodeClick('c--y6GcKj9am0CBdu_Hnt')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={1539.8838845627668}
          y={685.9392688143869}
          width={215.3}
          height={46.3}
          rx={5}
          fill="#d53f8c"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={1647.5338845627668}
          y={711.2392688143868}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Annotations</tspan>
        </text>
        <circle
          cx={1741.1838845627667}
          cy={709.0892688143869}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('c--y6GcKj9am0CBdu_Hnt') ? 'block' : 'none'}
        />
        <path
          d="M1737.1838845627667 709.0892688143869L1739.6838845627667 712.0892688143869L1745.1838845627667 707.0892688143869"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('c--y6GcKj9am0CBdu_Hnt') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="00_q6I95eO-PUUrKpPFY8"
        data-type="topic"
        data-title="Lambda Expressions"
        data-parent-id="g9P3548F38tYGjevBc42w"
        data-parent-title="Exception Handling"
        onClick={() => onNodeClick('00_q6I95eO-PUUrKpPFY8')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={1539.8838845627668}
          y={633.4214467697108}
          width={215.3}
          height={46.3}
          rx={5}
          fill="#d53f8c"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={1647.5338845627668}
          y={658.7214467697107}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Lambda Expressions</tspan>
        </text>
        <circle
          cx={1741.1838845627667}
          cy={656.5714467697107}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('00_q6I95eO-PUUrKpPFY8') ? 'block' : 'none'}
        />
        <path
          d="M1737.1838845627667 656.5714467697107L1739.6838845627667 659.5714467697107L1745.1838845627667 654.5714467697107"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('00_q6I95eO-PUUrKpPFY8') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="kdxy8Zssnc5lJjdmjUyMc"
        data-type="topic"
        data-title="Modules"
        onClick={() => onNodeClick('kdxy8Zssnc5lJjdmjUyMc')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={1539.8838845627668}
          y={738.457090859063}
          width={215.3}
          height={46.3}
          rx={5}
          fill="#d53f8c"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={1647.5338845627668}
          y={763.7570908590629}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Modules</tspan>
        </text>
        <circle
          cx={1741.1838845627667}
          cy={761.607090859063}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('kdxy8Zssnc5lJjdmjUyMc') ? 'block' : 'none'}
        />
        <path
          d="M1737.1838845627667 761.607090859063L1739.6838845627667 764.607090859063L1745.1838845627667 759.607090859063"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('kdxy8Zssnc5lJjdmjUyMc') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="a-EQiBUlSgdZba1mW36op"
        data-type="subtopic"
        data-title="Array vs ArrayList"
        onClick={() => onNodeClick('a-EQiBUlSgdZba1mW36op')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={1264.719698467589}
          y={938.8725017715202}
          width={201.3}
          height={46.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={1365.3696984675892}
          y={964.1725017715202}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Array vs ArrayList</tspan>
        </text>
        <circle
          cx={1452.019698467589}
          cy={962.0225017715202}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('a-EQiBUlSgdZba1mW36op') ? 'block' : 'none'}
        />
        <path
          d="M1448.019698467589 962.0225017715202L1450.519698467589 965.0225017715202L1456.019698467589 960.0225017715202"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('a-EQiBUlSgdZba1mW36op') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="XjkNd5WJ9yxW48dwHQNkZ"
        data-type="subtopic"
        data-title="Set"
        onClick={() => onNodeClick('XjkNd5WJ9yxW48dwHQNkZ')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={1264.719698467589}
          y={991.8725017715202}
          width={98.3}
          height={46.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={1313.8696984675892}
          y={1017.1725017715202}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Set</tspan>
        </text>
        <circle
          cx={1349.019698467589}
          cy={1015.0225017715202}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('XjkNd5WJ9yxW48dwHQNkZ') ? 'block' : 'none'}
        />
        <path
          d="M1345.019698467589 1015.0225017715202L1347.519698467589 1018.0225017715202L1353.019698467589 1013.0225017715202"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('XjkNd5WJ9yxW48dwHQNkZ') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="eKtdDtiJygKQ4PuEylFQY"
        data-type="subtopic"
        data-title="Map"
        onClick={() => onNodeClick('eKtdDtiJygKQ4PuEylFQY')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={1368.6554548486342}
          y={991.8725017715202}
          width={98.3}
          height={46.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={1417.8054548486343}
          y={1017.1725017715202}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Map</tspan>
        </text>
        <circle
          cx={1452.9554548486342}
          cy={1015.0225017715202}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('eKtdDtiJygKQ4PuEylFQY') ? 'block' : 'none'}
        />
        <path
          d="M1448.9554548486342 1015.0225017715202L1451.4554548486342 1018.0225017715202L1456.9554548486342 1013.0225017715202"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('eKtdDtiJygKQ4PuEylFQY') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="ThoWhXb4vUvNfE70_wMfa"
        data-type="subtopic"
        data-title="Queue"
        onClick={() => onNodeClick('ThoWhXb4vUvNfE70_wMfa')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={1264.719698467589}
          y={1044.87250177152}
          width={99.3}
          height={46.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={1314.3696984675892}
          y={1070.1725017715203}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Queue</tspan>
        </text>
        <circle
          cx={1350.019698467589}
          cy={1068.0225017715202}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('ThoWhXb4vUvNfE70_wMfa') ? 'block' : 'none'}
        />
        <path
          d="M1346.019698467589 1068.0225017715202L1348.519698467589 1071.0225017715202L1354.019698467589 1066.0225017715202"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('ThoWhXb4vUvNfE70_wMfa') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="DzfE_9WLAp-BrG3C1-MwU"
        data-type="subtopic"
        data-title="Stack"
        onClick={() => onNodeClick('DzfE_9WLAp-BrG3C1-MwU')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={1264.719698467589}
          y={1097.8725017715203}
          width={98.3}
          height={46.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={1313.8696984675892}
          y={1123.1725017715205}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Stack</tspan>
        </text>
        <circle
          cx={1349.019698467589}
          cy={1121.0225017715204}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('DzfE_9WLAp-BrG3C1-MwU') ? 'block' : 'none'}
        />
        <path
          d="M1345.019698467589 1121.0225017715204L1347.519698467589 1124.0225017715204L1353.019698467589 1119.0225017715204"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('DzfE_9WLAp-BrG3C1-MwU') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="DWO2-EPIUeKK5aQGiTuKc"
        data-type="subtopic"
        data-title="Dequeue"
        onClick={() => onNodeClick('DWO2-EPIUeKK5aQGiTuKc')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={1368.6554548486342}
          y={1044.87250177152}
          width={98.3}
          height={46.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={1417.8054548486343}
          y={1070.1725017715203}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Dequeue</tspan>
        </text>
        <circle
          cx={1452.9554548486342}
          cy={1068.0225017715202}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('DWO2-EPIUeKK5aQGiTuKc') ? 'block' : 'none'}
        />
        <path
          d="M1448.9554548486342 1068.0225017715202L1451.4554548486342 1071.0225017715202L1456.9554548486342 1066.0225017715202"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('DWO2-EPIUeKK5aQGiTuKc') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="-17LFO72I8RKjJRMXct9k"
        data-type="subtopic"
        data-title="Iterator"
        onClick={() => onNodeClick('-17LFO72I8RKjJRMXct9k')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={1368.6554548486342}
          y={1097.8725017715203}
          width={98.3}
          height={46.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={1417.8054548486343}
          y={1123.1725017715205}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Iterator</tspan>
        </text>
        <circle
          cx={1452.9554548486342}
          cy={1121.0225017715204}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('-17LFO72I8RKjJRMXct9k') ? 'block' : 'none'}
        />
        <path
          d="M1448.9554548486342 1121.0225017715204L1451.4554548486342 1124.0225017715204L1456.9554548486342 1119.0225017715204"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('-17LFO72I8RKjJRMXct9k') ? 'block' : 'none'}
        />
      </g>
      <g data-node-id="PX4ZcshR0QtsPElyZzSel" data-type="label">
        <text
          x={1324.3696984675892}
          y={922.3203519457165}
          textAnchor="start"
          dominantBaseline="auto"
          fontSize={17}
          fontWeight={600}
          fill="black"
        >
          <tspan>Collections</tspan>
        </text>
      </g>
      <g
        data-node-id="eL4pc6SaNiKP48PzN7mNe"
        data-type="subtopic"
        data-title="Generic Collections"
        onClick={() => onNodeClick('eL4pc6SaNiKP48PzN7mNe')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={1264.719698467589}
          y={1153.3611884486031}
          width={204.3}
          height={46.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={1366.8696984675892}
          y={1178.6611884486033}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Generic Collections</tspan>
        </text>
        <circle
          cx={1455.019698467589}
          cy={1176.5111884486032}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('eL4pc6SaNiKP48PzN7mNe') ? 'block' : 'none'}
        />
        <path
          d="M1451.019698467589 1176.5111884486032L1453.519698467589 1179.5111884486032L1459.019698467589 1174.5111884486032"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('eL4pc6SaNiKP48PzN7mNe') ? 'block' : 'none'}
        />
      </g>
      <g data-node-id="Z_rjrHtWp1Zp1G2YN0KfD" data-type="vertical">
        <line
          x1={1648.856875320924}
          y1={831.2420992601204}
          x2={1648.856875320924}
          y2={940.2420992601204}
          style={{
            strokeLinecap: 'round',
            strokeWidth: 3.65,
            stroke: '#cea500',
            strokeDasharray: 0,
          }}
        />
      </g>
      <g
        data-node-id="l9fxK8K9fcUqR7hs5TkWU"
        data-type="topic"
        data-title="Optionals"
        onClick={() => onNodeClick('l9fxK8K9fcUqR7hs5TkWU')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={1539.8838845627668}
          y={790.9749129037391}
          width={215.3}
          height={46.3}
          rx={5}
          fill="#d53f8c"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={1647.5338845627668}
          y={816.274912903739}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Optionals</tspan>
        </text>
        <circle
          cx={1741.1838845627667}
          cy={814.1249129037391}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('l9fxK8K9fcUqR7hs5TkWU') ? 'block' : 'none'}
        />
        <path
          d="M1737.1838845627667 814.1249129037391L1739.6838845627667 817.1249129037391L1745.1838845627667 812.1249129037391"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('l9fxK8K9fcUqR7hs5TkWU') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="g9P3548F38tYGjevBc42w"
        data-type="topic"
        data-title="Exception Handling"
        data-parent-id="zNHDLv26Xn3oMrDVSAP1Z"
        data-parent-title="Object Oriented Programming"
        onClick={() => onNodeClick('g9P3548F38tYGjevBc42w')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={1539.8838845627668}
          y={521.9036247250347}
          width={215.3}
          height={46.3}
          rx={5}
          fill="#d53f8c"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={1647.5338845627668}
          y={547.2036247250346}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Exception Handling</tspan>
        </text>
        <circle
          cx={1741.1838845627667}
          cy={545.0536247250346}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('g9P3548F38tYGjevBc42w') ? 'block' : 'none'}
        />
        <path
          d="M1737.1838845627667 545.0536247250346L1739.6838845627667 548.0536247250346L1745.1838845627667 543.0536247250346"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('g9P3548F38tYGjevBc42w') ? 'block' : 'none'}
        />
      </g>
      <g data-node-id="D1woaibP6qkuqmBQkZrhO" data-type="horizontal">
        <line
          x1={1174.7508238192552}
          y1={1188.2990031143668}
          x2={1252.7508238192552}
          y2={1188.2990031143668}
          style={{
            strokeLinecap: 'round',
            strokeWidth: 3.65,
            stroke: '#cea500',
            strokeDasharray: 0,
          }}
        />
      </g>
      <g
        data-node-id="_W84u4UXMSY0zvy6RJvFi"
        data-type="topic"
        data-title="Web Frameworks"
        onClick={() => onNodeClick('_W84u4UXMSY0zvy6RJvFi')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={1251.9999336025646}
          y={1502.8489519840193}
          width={229.3}
          height={46.3}
          rx={5}
          fill="#d53f8c"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={1366.6499336025647}
          y={1528.1489519840195}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Web Frameworks</tspan>
        </text>
        <circle
          cx={1467.2999336025646}
          cy={1525.9989519840194}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('_W84u4UXMSY0zvy6RJvFi') ? 'block' : 'none'}
        />
        <path
          d="M1463.2999336025646 1525.9989519840194L1465.7999336025646 1528.9989519840194L1471.2999336025646 1523.9989519840194"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('_W84u4UXMSY0zvy6RJvFi') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="xoryfi4SpJlkz-PV05ql6"
        data-type="subtopic"
        data-title="Spring (Spring Boot)"
        onClick={() => onNodeClick('xoryfi4SpJlkz-PV05ql6')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={1251.9999336025646}
          y={1316.6094233874953}
          width={229.3}
          height={46.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={1366.6499336025647}
          y={1341.9094233874955}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Spring (Spring Boot)</tspan>
        </text>
        <circle
          cx={1467.2999336025646}
          cy={1339.7594233874954}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('xoryfi4SpJlkz-PV05ql6') ? 'block' : 'none'}
        />
        <path
          d="M1463.2999336025646 1339.7594233874954L1465.7999336025646 1342.7594233874954L1471.2999336025646 1337.7594233874954"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('xoryfi4SpJlkz-PV05ql6') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="kN-mXxqUPNJNsJGQ0U_7J"
        data-type="subtopic"
        data-title="Play Framework"
        data-parent-id="_W84u4UXMSY0zvy6RJvFi"
        data-parent-title="Web Frameworks"
        onClick={() => onNodeClick('kN-mXxqUPNJNsJGQ0U_7J')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={1251.9999336025646}
          y={1422.6094233874953}
          width={229.3}
          height={46.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={1366.6499336025647}
          y={1447.9094233874955}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Play Framework</tspan>
        </text>
        <circle
          cx={1467.2999336025646}
          cy={1445.7594233874954}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('kN-mXxqUPNJNsJGQ0U_7J') ? 'block' : 'none'}
        />
        <path
          d="M1463.2999336025646 1445.7594233874954L1465.7999336025646 1448.7594233874954L1471.2999336025646 1443.7594233874954"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('kN-mXxqUPNJNsJGQ0U_7J') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="w-kcKPh8U0P_jtT90_1Xy"
        data-type="subtopic"
        data-title="Quarkus"
        onClick={() => onNodeClick('w-kcKPh8U0P_jtT90_1Xy')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={1251.9999336025646}
          y={1369.6094233874953}
          width={111.3}
          height={46.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={1307.6499336025647}
          y={1394.9094233874955}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Quarkus</tspan>
        </text>
        <circle
          cx={1349.2999336025646}
          cy={1392.7594233874954}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('w-kcKPh8U0P_jtT90_1Xy') ? 'block' : 'none'}
        />
        <path
          d="M1345.2999336025646 1392.7594233874954L1347.7999336025646 1395.7594233874954L1353.2999336025646 1390.7594233874954"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('w-kcKPh8U0P_jtT90_1Xy') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="81N1cZLue_Ii0uD5CV6kZ"
        data-type="topic"
        data-title="Build Tools"
        data-parent-id="_W84u4UXMSY0zvy6RJvFi"
        data-parent-title="Web Frameworks"
        onClick={() => onNodeClick('81N1cZLue_Ii0uD5CV6kZ')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={1008.2220474064458}
          y={1503.363322952089}
          width={178.3}
          height={46.3}
          rx={5}
          fill="#d53f8c"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={1097.3720474064457}
          y={1528.6633229520892}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Build Tools</tspan>
        </text>
        <circle
          cx={1172.5220474064458}
          cy={1526.513322952089}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('81N1cZLue_Ii0uD5CV6kZ') ? 'block' : 'none'}
        />
        <path
          d="M1168.5220474064458 1526.513322952089L1171.0220474064458 1529.513322952089L1176.5220474064458 1524.513322952089"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('81N1cZLue_Ii0uD5CV6kZ') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="VdL_fAHxmRbuF0J627beA"
        data-type="subtopic"
        data-title="Maven"
        onClick={() => onNodeClick('VdL_fAHxmRbuF0J627beA')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={1008.2220474064458}
          y={1318.5776953646334}
          width={178.3}
          height={46.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={1097.3720474064457}
          y={1343.8776953646336}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Maven</tspan>
        </text>
        <circle
          cx={1172.5220474064458}
          cy={1341.7276953646335}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('VdL_fAHxmRbuF0J627beA') ? 'block' : 'none'}
        />
        <path
          d="M1168.5220474064458 1341.7276953646335L1171.0220474064458 1344.7276953646335L1176.5220474064458 1339.7276953646335"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('VdL_fAHxmRbuF0J627beA') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="rmDIm5dqtdlNfPhvpqS7-"
        data-type="subtopic"
        data-title="Gradle"
        onClick={() => onNodeClick('rmDIm5dqtdlNfPhvpqS7-')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={1008.2220474064458}
          y={1371.5776953646334}
          width={178.3}
          height={46.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={1097.3720474064457}
          y={1396.8776953646336}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Gradle</tspan>
        </text>
        <circle
          cx={1172.5220474064458}
          cy={1394.7276953646335}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('rmDIm5dqtdlNfPhvpqS7-') ? 'block' : 'none'}
        />
        <path
          d="M1168.5220474064458 1394.7276953646335L1171.0220474064458 1397.7276953646335L1176.5220474064458 1392.7276953646335"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('rmDIm5dqtdlNfPhvpqS7-') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="6FMj9tMAQPii_1kLtHJLk"
        data-type="subtopic"
        data-title="Bazel"
        data-parent-id="81N1cZLue_Ii0uD5CV6kZ"
        data-parent-title="Build Tools"
        onClick={() => onNodeClick('6FMj9tMAQPii_1kLtHJLk')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={1008.2220474064458}
          y={1424.5776953646334}
          width={178.3}
          height={46.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={1097.3720474064457}
          y={1449.8776953646336}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Bazel</tspan>
        </text>
        <circle
          cx={1172.5220474064458}
          cy={1447.7276953646335}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('6FMj9tMAQPii_1kLtHJLk') ? 'block' : 'none'}
        />
        <path
          d="M1168.5220474064458 1447.7276953646335L1171.0220474064458 1450.7276953646335L1176.5220474064458 1445.7276953646335"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('6FMj9tMAQPii_1kLtHJLk') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="zItXmuluDtl6HkTYQ7qMh"
        data-type="topic"
        data-title="Dependency Injection"
        onClick={() => onNodeClick('zItXmuluDtl6HkTYQ7qMh')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={1539.8838845627668}
          y={943.2099244017678}
          width={215.3}
          height={46.3}
          rx={5}
          fill="#d53f8c"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={1647.5338845627668}
          y={968.5099244017678}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Dependency Injection</tspan>
        </text>
        <circle
          cx={1741.1838845627667}
          cy={966.3599244017678}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('zItXmuluDtl6HkTYQ7qMh') ? 'block' : 'none'}
        />
        <path
          d="M1737.1838845627667 966.3599244017678L1739.6838845627667 969.3599244017678L1745.1838845627667 964.3599244017678"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('zItXmuluDtl6HkTYQ7qMh') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="M0ybgK1JCycXhZ1dEpCFo"
        data-type="topic"
        data-title="I/O Operations"
        data-parent-id="zItXmuluDtl6HkTYQ7qMh"
        data-parent-title="Dependency Injection"
        onClick={() => onNodeClick('M0ybgK1JCycXhZ1dEpCFo')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={1539.8838845627668}
          y={1110.6703519457164}
          width={215.3}
          height={46.3}
          rx={5}
          fill="#d53f8c"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={1647.5338845627668}
          y={1135.9703519457166}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>I/O Operations</tspan>
        </text>
        <circle
          cx={1741.1838845627667}
          cy={1133.8203519457165}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('M0ybgK1JCycXhZ1dEpCFo') ? 'block' : 'none'}
        />
        <path
          d="M1737.1838845627667 1133.8203519457165L1739.6838845627667 1136.8203519457165L1745.1838845627667 1131.8203519457165"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('M0ybgK1JCycXhZ1dEpCFo') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="NowpzyPVFcX082j5YS5i8"
        data-type="topic"
        data-title="File Operations"
        onClick={() => onNodeClick('NowpzyPVFcX082j5YS5i8')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={1539.8838845627668}
          y={1163.6703519457164}
          width={215.3}
          height={46.3}
          rx={5}
          fill="#d53f8c"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={1647.5338845627668}
          y={1188.9703519457166}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>File Operations</tspan>
        </text>
        <circle
          cx={1741.1838845627667}
          cy={1186.8203519457165}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('NowpzyPVFcX082j5YS5i8') ? 'block' : 'none'}
        />
        <path
          d="M1737.1838845627667 1186.8203519457165L1739.6838845627667 1189.8203519457165L1745.1838845627667 1184.8203519457165"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('NowpzyPVFcX082j5YS5i8') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="shqS9-hg__mkOtnnl_I4l"
        data-type="topic"
        data-title="Concurrency"
        onClick={() => onNodeClick('shqS9-hg__mkOtnnl_I4l')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={975.1843015809069}
          y={1163.6703519457164}
          width={215.3}
          height={46.3}
          rx={5}
          fill="#d53f8c"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={1082.8343015809069}
          y={1188.9703519457166}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Concurrency</tspan>
        </text>
        <circle
          cx={1176.484301580907}
          cy={1186.8203519457165}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('shqS9-hg__mkOtnnl_I4l') ? 'block' : 'none'}
        />
        <path
          d="M1172.484301580907 1186.8203519457165L1174.984301580907 1189.8203519457165L1180.484301580907 1184.8203519457165"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('shqS9-hg__mkOtnnl_I4l') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="u_YysD7Bpnq-xkFX5yJGz"
        data-type="subtopic"
        data-title="Threads"
        data-parent-id="shqS9-hg__mkOtnnl_I4l"
        data-parent-title="Concurrency"
        onClick={() => onNodeClick('u_YysD7Bpnq-xkFX5yJGz')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={975.1843015809069}
          y={1074.87250177152}
          width={215.3}
          height={46.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={1082.8343015809069}
          y={1100.1725017715203}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Threads</tspan>
        </text>
        <circle
          cx={1176.484301580907}
          cy={1098.0225017715202}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('u_YysD7Bpnq-xkFX5yJGz') ? 'block' : 'none'}
        />
        <path
          d="M1172.484301580907 1098.0225017715202L1174.984301580907 1101.0225017715202L1180.484301580907 1096.0225017715202"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('u_YysD7Bpnq-xkFX5yJGz') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="vJSq1GJLIMQ6IIB8CMK8g"
        data-type="subtopic"
        data-title="Virtual Threads"
        onClick={() => onNodeClick('vJSq1GJLIMQ6IIB8CMK8g')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={975.1843015809069}
          y={1021.8725017715202}
          width={215.3}
          height={46.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={1082.8343015809069}
          y={1047.1725017715203}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Virtual Threads</tspan>
        </text>
        <circle
          cx={1176.484301580907}
          cy={1045.0225017715202}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('vJSq1GJLIMQ6IIB8CMK8g') ? 'block' : 'none'}
        />
        <path
          d="M1172.484301580907 1045.0225017715202L1174.984301580907 1048.0225017715202L1180.484301580907 1043.0225017715202"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('vJSq1GJLIMQ6IIB8CMK8g') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="wEc7pSVU5G2c6Zqmtb_1k"
        data-type="subtopic"
        data-title="Java Memory Model"
        onClick={() => onNodeClick('wEc7pSVU5G2c6Zqmtb_1k')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={975.1843015809069}
          y={968.8725017715202}
          width={215.3}
          height={46.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={1082.8343015809069}
          y={994.1725017715202}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Java Memory Model</tspan>
        </text>
        <circle
          cx={1176.484301580907}
          cy={992.0225017715202}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('wEc7pSVU5G2c6Zqmtb_1k') ? 'block' : 'none'}
        />
        <path
          d="M1172.484301580907 992.0225017715202L1174.984301580907 995.0225017715202L1180.484301580907 990.0225017715202"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('wEc7pSVU5G2c6Zqmtb_1k') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="U4Wx3MH3LgJLa0n9Ne0Br"
        data-type="subtopic"
        data-title="volatile keyword"
        onClick={() => onNodeClick('U4Wx3MH3LgJLa0n9Ne0Br')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={975.1843015809069}
          y={916.6703519457166}
          width={215.3}
          height={46.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={1082.8343015809069}
          y={941.9703519457165}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>volatile keyword</tspan>
        </text>
        <circle
          cx={1176.484301580907}
          cy={939.8203519457165}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('U4Wx3MH3LgJLa0n9Ne0Br') ? 'block' : 'none'}
        />
        <path
          d="M1172.484301580907 939.8203519457165L1174.984301580907 942.8203519457165L1180.484301580907 937.8203519457165"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('U4Wx3MH3LgJLa0n9Ne0Br') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="_wV2VQq6MIY1rVHjK8pfu"
        data-type="topic"
        data-title="Cryptography"
        onClick={() => onNodeClick('_wV2VQq6MIY1rVHjK8pfu')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={703.3573106597293}
          y={915.6703519457166}
          width={219.3}
          height={46.3}
          rx={5}
          fill="#d53f8c"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={813.0073106597292}
          y={940.9703519457165}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Cryptography</tspan>
        </text>
        <circle
          cx={908.6573106597293}
          cy={938.8203519457165}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('_wV2VQq6MIY1rVHjK8pfu') ? 'block' : 'none'}
        />
        <path
          d="M904.6573106597293 938.8203519457165L907.1573106597293 941.8203519457165L912.6573106597293 936.8203519457165"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('_wV2VQq6MIY1rVHjK8pfu') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="9h20XVRli7TDq0QIJwX2U"
        data-type="topic"
        data-title="Date and Time"
        onClick={() => onNodeClick('9h20XVRli7TDq0QIJwX2U')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={702.51187094886}
          y={967.8725017715202}
          width={221.3}
          height={46.3}
          rx={5}
          fill="#d53f8c"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={813.1618709488599}
          y={993.1725017715202}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Date and Time</tspan>
        </text>
        <circle
          cx={909.8118709488599}
          cy={991.0225017715202}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('9h20XVRli7TDq0QIJwX2U') ? 'block' : 'none'}
        />
        <path
          d="M905.8118709488599 991.0225017715202L908.3118709488599 994.0225017715202L913.8118709488599 989.0225017715202"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('9h20XVRli7TDq0QIJwX2U') ? 'block' : 'none'}
        />
      </g>
      <g data-node-id="UGccAJeFA636IiCySl-zF" data-type="label">
        <text
          x={721.0073106597292}
          y={1531.8599244017678}
          textAnchor="start"
          dominantBaseline="auto"
          fontSize={17}
          fill="black"
        >
          <tspan>Functional Programming</tspan>
        </text>
      </g>
      <g
        data-node-id="1Mk_zXxCCcUoX-gFxtlnf"
        data-type="subtopic"
        data-title="Functional Composition"
        onClick={() => onNodeClick('1Mk_zXxCCcUoX-gFxtlnf')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={712.3573106597293}
          y={1396.2099244017677}
          width={224.3}
          height={46.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={824.5073106597292}
          y={1421.5099244017679}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Functional Composition</tspan>
        </text>
        <circle
          cx={922.6573106597293}
          cy={1419.3599244017678}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('1Mk_zXxCCcUoX-gFxtlnf') ? 'block' : 'none'}
        />
        <path
          d="M918.6573106597293 1419.3599244017678L921.1573106597293 1422.3599244017678L926.6573106597293 1417.3599244017678"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('1Mk_zXxCCcUoX-gFxtlnf') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="dz6bCmB4dgA7VVZ448cN6"
        data-type="subtopic"
        data-title="High Order Functions"
        onClick={() => onNodeClick('dz6bCmB4dgA7VVZ448cN6')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={712.3573106597293}
          y={1290.2099244017677}
          width={224.3}
          height={46.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={824.5073106597292}
          y={1315.5099244017679}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>High Order Functions</tspan>
        </text>
        <circle
          cx={922.6573106597293}
          cy={1313.3599244017678}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('dz6bCmB4dgA7VVZ448cN6') ? 'block' : 'none'}
        />
        <path
          d="M918.6573106597293 1313.3599244017678L921.1573106597293 1316.3599244017678L926.6573106597293 1311.3599244017678"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('dz6bCmB4dgA7VVZ448cN6') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="SityDdjhhNZ9CO3Tg0VI9"
        data-type="subtopic"
        data-title="Functional Interfaces"
        onClick={() => onNodeClick('SityDdjhhNZ9CO3Tg0VI9')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={712.3573106597293}
          y={1343.2099244017677}
          width={224.3}
          height={46.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={824.5073106597292}
          y={1368.5099244017679}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Functional Interfaces</tspan>
        </text>
        <circle
          cx={922.6573106597293}
          cy={1366.3599244017678}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('SityDdjhhNZ9CO3Tg0VI9') ? 'block' : 'none'}
        />
        <path
          d="M918.6573106597293 1366.3599244017678L921.1573106597293 1369.3599244017678L926.6573106597293 1364.3599244017678"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('SityDdjhhNZ9CO3Tg0VI9') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="WHxAwfdKHQSOg0TLX05EG"
        data-type="subtopic"
        data-title="Stream API"
        onClick={() => onNodeClick('WHxAwfdKHQSOg0TLX05EG')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={712.3573106597293}
          y={1449.2099244017677}
          width={224.3}
          height={46.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={824.5073106597292}
          y={1474.5099244017679}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Stream API</tspan>
        </text>
        <circle
          cx={922.6573106597293}
          cy={1472.3599244017678}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('WHxAwfdKHQSOg0TLX05EG') ? 'block' : 'none'}
        />
        <path
          d="M918.6573106597293 1472.3599244017678L921.1573106597293 1475.3599244017678L926.6573106597293 1470.3599244017678"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('WHxAwfdKHQSOg0TLX05EG') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="JeMG0gU8IVRBZgczjXmPi"
        data-type="topic"
        data-title="Networking"
        onClick={() => onNodeClick('JeMG0gU8IVRBZgczjXmPi')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={701.3573106597293}
          y={1020.0746515973239}
          width={221.3}
          height={46.3}
          rx={5}
          fill="#d53f8c"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={812.0073106597292}
          y={1045.374651597324}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Networking</tspan>
        </text>
        <circle
          cx={908.6573106597293}
          cy={1043.2246515973238}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('JeMG0gU8IVRBZgczjXmPi') ? 'block' : 'none'}
        />
        <path
          d="M904.6573106597293 1043.2246515973238L907.1573106597293 1046.2246515973238L912.6573106597293 1041.2246515973238"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('JeMG0gU8IVRBZgczjXmPi') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="C7rB3jkshHFN7TkHRJPlz"
        data-type="topic"
        data-title="Regular Expressions"
        onClick={() => onNodeClick('C7rB3jkshHFN7TkHRJPlz')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={701.3573106597293}
          y={1074.87250177152}
          width={221.3}
          height={46.3}
          rx={5}
          fill="#d53f8c"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={812.0073106597292}
          y={1100.1725017715203}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Regular Expressions</tspan>
        </text>
        <circle
          cx={908.6573106597293}
          cy={1098.0225017715202}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('C7rB3jkshHFN7TkHRJPlz') ? 'block' : 'none'}
        />
        <path
          d="M904.6573106597293 1098.0225017715202L907.1573106597293 1101.0225017715202L912.6573106597293 1096.0225017715202"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('C7rB3jkshHFN7TkHRJPlz') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="fV-gW51jhna2__Ln2HIIh"
        data-type="topic"
        data-title="Database Access"
        data-parent-id="_W84u4UXMSY0zvy6RJvFi"
        data-parent-title="Web Frameworks"
        onClick={() => onNodeClick('fV-gW51jhna2__Ln2HIIh')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={1530.3838845627668}
          y={1501.7099244017677}
          width={218.3}
          height={46.3}
          rx={5}
          fill="#d53f8c"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={1639.5338845627668}
          y={1527.0099244017679}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Database Access</tspan>
        </text>
        <circle
          cx={1734.6838845627667}
          cy={1524.8599244017678}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('fV-gW51jhna2__Ln2HIIh') ? 'block' : 'none'}
        />
        <path
          d="M1730.6838845627667 1524.8599244017678L1733.1838845627667 1527.8599244017678L1738.6838845627667 1522.8599244017678"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('fV-gW51jhna2__Ln2HIIh') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="WzWOxBUKKg6LeuBmVesc2"
        data-type="subtopic"
        data-title="Spring Data JPA"
        data-parent-id="fV-gW51jhna2__Ln2HIIh"
        data-parent-title="Database Access"
        onClick={() => onNodeClick('WzWOxBUKKg6LeuBmVesc2')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={1555.8838845627668}
          y={1419.1969443073326}
          width={167.3}
          height={46.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={1639.5338845627668}
          y={1444.4969443073328}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Spring Data JPA</tspan>
        </text>
        <circle
          cx={1709.1838845627667}
          cy={1442.3469443073327}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('WzWOxBUKKg6LeuBmVesc2') ? 'block' : 'none'}
        />
        <path
          d="M1705.1838845627667 1442.3469443073327L1707.6838845627667 1445.3469443073327L1713.1838845627667 1440.3469443073327"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('WzWOxBUKKg6LeuBmVesc2') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="UEiDzzodyEu5O1xFAFDly"
        data-type="subtopic"
        data-title="Hibernate"
        onClick={() => onNodeClick('UEiDzzodyEu5O1xFAFDly')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={1555.8838845627668}
          y={1366.1969443073326}
          width={167.3}
          height={46.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={1639.5338845627668}
          y={1391.4969443073328}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Hibernate</tspan>
        </text>
        <circle
          cx={1709.1838845627667}
          cy={1389.3469443073327}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('UEiDzzodyEu5O1xFAFDly') ? 'block' : 'none'}
        />
        <path
          d="M1705.1838845627667 1389.3469443073327L1707.6838845627667 1392.3469443073327L1713.1838845627667 1387.3469443073327"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('UEiDzzodyEu5O1xFAFDly') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="X2rJ3BY1ytFKsbJqJETFu"
        data-type="subtopic"
        data-title="EBean"
        onClick={() => onNodeClick('X2rJ3BY1ytFKsbJqJETFu')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={1555.8838845627668}
          y={1313.1969443073326}
          width={167.3}
          height={46.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={1639.5338845627668}
          y={1338.4969443073328}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>EBean</tspan>
        </text>
        <circle
          cx={1709.1838845627667}
          cy={1336.3469443073327}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('X2rJ3BY1ytFKsbJqJETFu') ? 'block' : 'none'}
        />
        <path
          d="M1705.1838845627667 1336.3469443073327L1707.6838845627667 1339.3469443073327L1713.1838845627667 1334.3469443073327"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('X2rJ3BY1ytFKsbJqJETFu') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="d9F5Wt8onY125DLuzNULg"
        data-type="topic"
        data-title="Logging Frameworks"
        data-parent-id="fV-gW51jhna2__Ln2HIIh"
        data-parent-title="Database Access"
        onClick={() => onNodeClick('d9F5Wt8onY125DLuzNULg')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={1530.3838845627668}
          y={1623.6696545591994}
          width={218.3}
          height={46.3}
          rx={5}
          fill="#d53f8c"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={1639.5338845627668}
          y={1648.9696545591996}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Logging Frameworks</tspan>
        </text>
        <circle
          cx={1734.6838845627667}
          cy={1646.8196545591995}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('d9F5Wt8onY125DLuzNULg') ? 'block' : 'none'}
        />
        <path
          d="M1730.6838845627667 1646.8196545591995L1733.1838845627667 1649.8196545591995L1738.6838845627667 1644.8196545591995"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('d9F5Wt8onY125DLuzNULg') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="okC1uMdyfIJAhX_R9Npsw"
        data-type="subtopic"
        data-title="Logback"
        onClick={() => onNodeClick('okC1uMdyfIJAhX_R9Npsw')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={1533.8969679422955}
          y={1718.1568987197154}
          width={108.3}
          height={46.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={1588.0469679422956}
          y={1743.4568987197156}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Logback</tspan>
        </text>
        <circle
          cx={1628.1969679422955}
          cy={1741.3068987197155}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('okC1uMdyfIJAhX_R9Npsw') ? 'block' : 'none'}
        />
        <path
          d="M1624.1969679422955 1741.3068987197155L1626.6969679422955 1744.3068987197155L1632.1969679422955 1739.3068987197155"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('okC1uMdyfIJAhX_R9Npsw') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="sFaNj_1MviaTc6UIfjXl6"
        data-type="subtopic"
        data-title="Log4j2"
        onClick={() => onNodeClick('sFaNj_1MviaTc6UIfjXl6')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={1649.5717949048953}
          y={1718.1568987197154}
          width={98.3}
          height={46.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={1698.7217949048954}
          y={1743.4568987197156}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Log4j2</tspan>
        </text>
        <circle
          cx={1733.8717949048953}
          cy={1741.3068987197155}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('sFaNj_1MviaTc6UIfjXl6') ? 'block' : 'none'}
        />
        <path
          d="M1729.8717949048953 1741.3068987197155L1732.3717949048953 1744.3068987197155L1737.8717949048953 1739.3068987197155"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('sFaNj_1MviaTc6UIfjXl6') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="LGlZHKqyQ-aWtHnhklhgn"
        data-type="subtopic"
        data-title="SLF4J"
        onClick={() => onNodeClick('LGlZHKqyQ-aWtHnhklhgn')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={1533.8969679422955}
          y={1771.1568987197154}
          width={108.3}
          height={46.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={1588.0469679422956}
          y={1796.4568987197156}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>SLF4J</tspan>
        </text>
        <circle
          cx={1628.1969679422955}
          cy={1794.3068987197155}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('LGlZHKqyQ-aWtHnhklhgn') ? 'block' : 'none'}
        />
        <path
          d="M1624.1969679422955 1794.3068987197155L1626.6969679422955 1797.3068987197155L1632.1969679422955 1792.3068987197155"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('LGlZHKqyQ-aWtHnhklhgn') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="Fn7aAaGbwYsAp4xLuuFud"
        data-type="subtopic"
        data-title="TinyLog"
        onClick={() => onNodeClick('Fn7aAaGbwYsAp4xLuuFud')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={1649.5717949048953}
          y={1771.1568987197154}
          width={98.3}
          height={46.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={1698.7217949048954}
          y={1796.4568987197156}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>TinyLog</tspan>
        </text>
        <circle
          cx={1733.8717949048953}
          cy={1794.3068987197155}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('Fn7aAaGbwYsAp4xLuuFud') ? 'block' : 'none'}
        />
        <path
          d="M1729.8717949048953 1794.3068987197155L1732.3717949048953 1797.3068987197155L1737.8717949048953 1792.3068987197155"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('Fn7aAaGbwYsAp4xLuuFud') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="LgpsnXV0CTvTspjnsd0Rd"
        data-type="topic"
        data-title="Testing"
        data-parent-id="vRZAtylN3zfHIv3SidYkA"
        data-parent-title="Documentation"
        onClick={() => onNodeClick('LgpsnXV0CTvTspjnsd0Rd')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={1291.588551984822}
          y={1753.3659477948859}
          width={159.3}
          height={47.3}
          rx={5}
          fill="#d53f8c"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={1371.2385519848222}
          y={1779.165947794886}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Testing</tspan>
        </text>
        <circle
          cx={1436.888551984822}
          cy={1777.015947794886}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('LgpsnXV0CTvTspjnsd0Rd') ? 'block' : 'none'}
        />
        <path
          d="M1432.888551984822 1777.015947794886L1435.388551984822 1780.015947794886L1440.888551984822 1775.015947794886"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('LgpsnXV0CTvTspjnsd0Rd') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="9UbRG752qxJdUwmqEAjN3"
        data-type="subtopic"
        data-title="JDBC"
        onClick={() => onNodeClick('9UbRG752qxJdUwmqEAjN3')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={1555.8838845627668}
          y={1260.1969443073326}
          width={167.3}
          height={46.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={1639.5338845627668}
          y={1285.4969443073328}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>JDBC</tspan>
        </text>
        <circle
          cx={1709.1838845627667}
          cy={1283.3469443073327}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('9UbRG752qxJdUwmqEAjN3') ? 'block' : 'none'}
        />
        <path
          d="M1705.1838845627667 1283.3469443073327L1707.6838845627667 1286.3469443073327L1713.1838845627667 1281.3469443073327"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('9UbRG752qxJdUwmqEAjN3') ? 'block' : 'none'}
        />
      </g>
      <g data-node-id="ahcnPvftbi83gtiqV6VTP" data-type="label">
        <text
          x={722.482369832682}
          y={1831.4390443834811}
          textAnchor="start"
          dominantBaseline="auto"
          fontSize={17}
          fill="black"
          fontWeight={600}
        >
          <tspan>Unit Testing</tspan>
        </text>
      </g>
      <g
        data-node-id="hY1-sEpTmpaj1PregdkFf"
        data-type="subtopic"
        data-title="JUnit"
        onClick={() => onNodeClick('hY1-sEpTmpaj1PregdkFf')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={713.832369832682}
          y={1697.789044383481}
          width={117.3}
          height={46.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={772.482369832682}
          y={1723.0890443834812}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>JUnit</tspan>
        </text>
        <circle
          cx={817.132369832682}
          cy={1720.9390443834811}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('hY1-sEpTmpaj1PregdkFf') ? 'block' : 'none'}
        />
        <path
          d="M813.132369832682 1720.9390443834811L815.632369832682 1723.9390443834811L821.132369832682 1718.9390443834811"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('hY1-sEpTmpaj1PregdkFf') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="XU2C8bF9ICej8LS7ZGTTv"
        data-type="subtopic"
        data-title="TestNG"
        onClick={() => onNodeClick('XU2C8bF9ICej8LS7ZGTTv')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={713.832369832682}
          y={1750.789044383481}
          width={117.3}
          height={46.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={772.482369832682}
          y={1776.0890443834812}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>TestNG</tspan>
        </text>
        <circle
          cx={817.132369832682}
          cy={1773.9390443834811}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('XU2C8bF9ICej8LS7ZGTTv') ? 'block' : 'none'}
        />
        <path
          d="M813.132369832682 1773.9390443834811L815.632369832682 1776.9390443834811L821.132369832682 1771.9390443834811"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('XU2C8bF9ICej8LS7ZGTTv') ? 'block' : 'none'}
        />
      </g>
      <g data-node-id="lI6ST4WcGtPdKSoWIxStg" data-type="label">
        <text
          x={864.3929054677501}
          y={1834.5740097760008}
          textAnchor="start"
          dominantBaseline="auto"
          fontSize={17}
          fill="black"
          fontWeight={600}
        >
          <tspan>Integration Testing</tspan>
        </text>
      </g>
      <g
        data-node-id="gB4XUR9nCdF1-dOEwGcHi"
        data-type="subtopic"
        data-title="REST Assured"
        onClick={() => onNodeClick('gB4XUR9nCdF1-dOEwGcHi')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={855.7429054677501}
          y={1698.9240097760007}
          width={157.3}
          height={46.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={934.3929054677501}
          y={1724.224009776001}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>REST Assured</tspan>
        </text>
        <circle
          cx={999.0429054677502}
          cy={1722.0740097760008}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('gB4XUR9nCdF1-dOEwGcHi') ? 'block' : 'none'}
        />
        <path
          d="M995.0429054677502 1722.0740097760008L997.5429054677502 1725.0740097760008L1003.0429054677502 1720.0740097760008"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('gB4XUR9nCdF1-dOEwGcHi') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="U2BqOY49HaII6mKQB3SVt"
        data-type="subtopic"
        data-title="JMeter"
        onClick={() => onNodeClick('U2BqOY49HaII6mKQB3SVt')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={855.7429054677501}
          y={1751.9240097760007}
          width={157.3}
          height={46.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={934.3929054677501}
          y={1777.224009776001}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>JMeter</tspan>
        </text>
        <circle
          cx={999.0429054677502}
          cy={1775.0740097760008}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('U2BqOY49HaII6mKQB3SVt') ? 'block' : 'none'}
        />
        <path
          d="M995.0429054677502 1775.0740097760008L997.5429054677502 1778.0740097760008L1003.0429054677502 1773.0740097760008"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('U2BqOY49HaII6mKQB3SVt') ? 'block' : 'none'}
        />
      </g>
      <g data-node-id="BFX3fjnFTHVnNnqMudZoK" data-type="label">
        <text
          x={1056.8252013753893}
          y={1787.015947794886}
          textAnchor="start"
          dominantBaseline="auto"
          fontSize={17}
          fill="black"
          fontWeight={600}
        >
          <tspan>Behavior Testing</tspan>
        </text>
      </g>
      <g
        data-node-id="UFDy19TNkykRsKv4vRsVJ"
        data-type="subtopic"
        data-title="Cucumber-JVM"
        onClick={() => onNodeClick('UFDy19TNkykRsKv4vRsVJ')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={1031.6752013753892}
          y={1704.3659477948859}
          width={175.3}
          height={46.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={1119.3252013753893}
          y={1729.665947794886}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Cucumber-JVM</tspan>
        </text>
        <circle
          cx={1192.9752013753891}
          cy={1727.515947794886}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('UFDy19TNkykRsKv4vRsVJ') ? 'block' : 'none'}
        />
        <path
          d="M1188.9752013753891 1727.515947794886L1191.4752013753891 1730.515947794886L1196.9752013753891 1725.515947794886"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('UFDy19TNkykRsKv4vRsVJ') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="mLM1HJf6_pxrUDOmb45ew"
        data-type="subtopic"
        data-title="Mocking > Mockito"
        onClick={() => onNodeClick('mLM1HJf6_pxrUDOmb45ew')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={1031.6752013753892}
          y={1803.789044383481}
          width={192.3}
          height={40.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={1119.8252013753893}
          y={1825.0890443834812}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Mocking &gt; Mockito</tspan>
        </text>
        <circle
          cx={1201.9752013753894}
          cy={1832.9390443834811}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('mLM1HJf6_pxrUDOmb45ew') ? 'block' : 'none'}
        />
        <path
          d="M1197.9752013753894 1832.9390443834811L1200.4752013753894 1835.9390443834811L1205.9752013753894 1830.9390443834811"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('mLM1HJf6_pxrUDOmb45ew') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="OrkJa48HIDmrLOgCBpimA"
        data-type="subtopic"
        data-title="Javalin"
        onClick={() => onNodeClick('OrkJa48HIDmrLOgCBpimA')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={1369.9999336025646}
          y={1369.6094233874953}
          width={111.3}
          height={46.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={1425.6499336025647}
          y={1394.9094233874955}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Javalin</tspan>
        </text>
        <circle
          cx={1467.2999336025646}
          cy={1392.7594233874954}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('OrkJa48HIDmrLOgCBpimA') ? 'block' : 'none'}
        />
        <path
          d="M1463.2999336025646 1392.7594233874954L1465.7999336025646 1395.7594233874954L1471.2999336025646 1390.7594233874954"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('OrkJa48HIDmrLOgCBpimA') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="vRZAtylN3zfHIv3SidYkA"
        data-type="topic"
        data-title="Documentation"
        data-parent-id="d9F5Wt8onY125DLuzNULg"
        data-parent-title="Logging Frameworks"
        onClick={() => onNodeClick('vRZAtylN3zfHIv3SidYkA')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={1291.588551984822}
          y={1623.6696545591994}
          width={159.3}
          height={46.3}
          rx={5}
          fill="#d53f8c"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={1371.2385519848222}
          y={1648.9696545591996}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Documentation</tspan>
        </text>
        <circle
          cx={1436.888551984822}
          cy={1646.8196545591995}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('vRZAtylN3zfHIv3SidYkA') ? 'block' : 'none'}
        />
        <path
          d="M1432.888551984822 1646.8196545591995L1435.388551984822 1649.8196545591995L1440.888551984822 1644.8196545591995"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('vRZAtylN3zfHIv3SidYkA') ? 'block' : 'none'}
        />
      </g>
      <g
        data-node-id="d3Tsc7KPhtjS0eC4Zbq8B"
        data-type="subtopic"
        data-title="Javadoc"
        data-parent-id="vRZAtylN3zfHIv3SidYkA"
        data-parent-title="Documentation"
        onClick={() => onNodeClick('d3Tsc7KPhtjS0eC4Zbq8B')}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={1109.6752013753892}
          y={1623.6696545591994}
          width={106.3}
          height={46.3}
          rx={5}
          fill="#0ea5e9"
          stroke="white"
          strokeWidth={2.7}
        />
        <text
          x={1162.8252013753893}
          y={1648.9696545591996}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={17}
          fill="#ffffff"
        >
          <tspan>Javadoc</tspan>
        </text>
        <circle
          cx={1201.9752013753891}
          cy={1646.8196545591995}
          r={9.5}
          fill="#16a34a"
          display={isCompleted('d3Tsc7KPhtjS0eC4Zbq8B') ? 'block' : 'none'}
        />
        <path
          d="M1197.9752013753891 1646.8196545591995L1200.4752013753891 1649.8196545591995L1205.9752013753891 1644.8196545591995"
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          display={isCompleted('d3Tsc7KPhtjS0eC4Zbq8B') ? 'block' : 'none'}
        />
      </g>
    </svg>
  )
}
