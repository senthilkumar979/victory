import React, { useCallback } from 'react'

export const ReactRoadmap = ({
  onNodeClick,
  completedNodes = [],
}: {
  onNodeClick: (nodeId: string) => void
  completedNodes: string[]
}) => {
  const isCompleted = useCallback(
    (nodeId: string) => completedNodes.includes(nodeId),
    [completedNodes],
  )

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-540 -133 1115 2233"
      version="1.1"
    >
      <path
        d="M9.04031453135002,-89.76957062917046 C9.04031453135002,-43.4126201950925 9.04031453135002,-43.4126201950925 9.04031453135002,2.944330238985458"
        fill="none"
        stroke="#cea500"
        strokeWidth="3.5"
        data-edge-id="reactflow__edge-iogwMmOvub2ZF4zgg6WyFx2-XDvH2t3AJGevS17uM8TO6w1"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="0"
      ></path>
      <path
        d="M112.54031453135002,139.44433023898546 C140.79258033331845,139.44433023898546 140.79258033331845,139.44433023898546 169.0448461352869,139.44433023898546"
        fill="none"
        stroke="#cea500"
        strokeWidth="3.5"
        data-edge-id="reactflow__edge-tU4Umtnfu01t9gLlnlK6bz2-y1"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="0.8 8"
      ></path>
      <path
        d="M9.04031453135002,51.94433023898546 C9.04031453135002,83.44433023898546 9.04031453135002,83.44433023898546 9.04031453135002,114.94433023898546"
        fill="none"
        stroke="#cea500"
        strokeWidth="3.5"
        data-edge-id="reactflow__edge-XDvH2t3AJGevS17uM8TO6x2-tU4Umtnfu01t9gLlnlK6bw2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="0"
      ></path>
      <path
        d="M-94.45968546864998,231.94433023898546 C-186.24250546217766,231.94433023898546 -186.24250546217766,231.94433023898546 -278.02532545570534,231.94433023898546"
        fill="none"
        stroke="#cea500"
        strokeWidth="3.5"
        data-edge-id="reactflow__edge-0uiGsC5SWavNdlFqizkKey2-8mw4TxlLN4ZKAlLl-_NVVz1"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="0.8 8"
      ></path>
      <path
        d="M9.04031453135002,163.94433023898546 C9.04031453135002,185.69433023898546 9.04031453135002,185.69433023898546 9.04031453135002,207.44433023898546"
        fill="none"
        stroke="#cea500"
        strokeWidth="3.5"
        data-edge-id="reactflow__edge-tU4Umtnfu01t9gLlnlK6bx2-0uiGsC5SWavNdlFqizkKew2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="0"
      ></path>
      <path
        d="M112.54031453135002,231.94433023898546 C205.29258033331843,231.94433023898546 205.29258033331843,231.94433023898546 298.04484613528683,231.94433023898546"
        fill="none"
        stroke="#cea500"
        strokeWidth="3.5"
        data-edge-id="reactflow__edge-79K4xgljcoSHkCYI1D55Oz2-0uiGsC5SWavNdlFqizkKey2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="0"
      ></path>
      <path
        d="M298.04484613528683,231.94433023898546 C234.04484613528686,231.94433023898546 234.04484613528686,566.0892656435051 170.0448461352869,566.0892656435051"
        fill="none"
        stroke="#cea500"
        strokeWidth="3.5"
        data-edge-id="reactflow__edge-0uiGsC5SWavNdlFqizkKey2-thfnymb_UIiKxakKfiua5z1"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="0"
      ></path>
      <path
        d="M57.04484613528689,566.0892656435051 C28.04484613528686,566.0892656435051 28.04484613528686,545.5892656435051 -0.9551538647131679,545.5892656435051"
        fill="none"
        stroke="#cea500"
        strokeWidth="3.5"
        data-edge-id="reactflow__edge-thfnymb_UIiKxakKfiua5y2-HX75SExuzR5AP7TQ94qidz1"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="0.8 8"
      ></path>
      <path
        d="M57.04484613528689,566.0892656435051 C28.04484613528686,566.0892656435051 28.04484613528686,598.5892656435051 -0.9551538647131679,598.5892656435051"
        fill="none"
        stroke="#cea500"
        strokeWidth="3.5"
        data-edge-id="reactflow__edge-thfnymb_UIiKxakKfiua5y2-mkyU0ug8MXxV4biHuOityz1"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="0.8 8"
      ></path>
      <path
        d="M170.0448461352869,566.0892656435051 C281.5097603397908,566.0892656435051 281.5097603397908,710.7974386815656 392.97467454429466,710.7974386815656"
        fill="none"
        stroke="#cea500"
        strokeWidth="3.5"
        data-edge-id="reactflow__edge-LbLQhonBqzxHU6B-L--Vqz2-thfnymb_UIiKxakKfiua5y1"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="0"
      ></path>
      <path
        d="M451.97467454429466,735.2974386815656 C451.97467454429466,754.0474386815656 451.97467454429466,754.0474386815656 451.97467454429466,772.7974386815656"
        fill="none"
        stroke="#cea500"
        strokeWidth="3.5"
        data-edge-id="reactflow__edge-thfnymb_UIiKxakKfiua5x2-jvp43wFkKlGQX2y7IxkbMw2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="0.8 8"
      ></path>
      <path
        d="M392.97467454429466,710.7974386815656 C317.83393779735883,710.7974386815656 317.83393779735883,891.9443302389855 242.693201050423,891.9443302389855"
        fill="none"
        stroke="#cea500"
        strokeWidth="3.5"
        data-edge-id="reactflow__edge-NStw6bi_pPB49K41BFSgoy2-thfnymb_UIiKxakKfiua5z1"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="0"
      ></path>
      <path
        d="M146.193201050423,867.4443302389855 C146.193201050423,854.1943302389855 146.193201050423,854.1943302389855 146.193201050423,840.9443302389855"
        fill="none"
        stroke="#cea500"
        strokeWidth="3.5"
        data-edge-id="reactflow__edge-thfnymb_UIiKxakKfiua5w2-yI6XiNW04EL78UL4lkVgdx1"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="0.8 8"
      ></path>
      <path
        d="M-125.52532545570534,838.9443302389855 C-125.52532545570534,853.1943302389855 -125.52532545570534,853.1943302389855 -125.52532545570534,867.4443302389855"
        fill="none"
        stroke="#cea500"
        strokeWidth="3.5"
        data-edge-id="reactflow__edge-akVNUPOqaTXaSHoQFlkP_x2-DfrCkbD-HEHwLymv10zb5w2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="0.8 8"
      ></path>
      <path
        d="M49.693201050423,891.9443302389855 C-3.6660622026411716,891.9443302389855 -3.6660622026411716,891.9443302389855 -57.02532545570534,891.9443302389855"
        fill="none"
        stroke="#cea500"
        strokeWidth="3.5"
        data-edge-id="reactflow__edge-I7_mX4h-Yywp1YyTJRKXIy2-DfrCkbD-HEHwLymv10zb5z1"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="0"
      ></path>
      <path
        d="M-194.02532545570534,891.9443302389855 C-244.52532545570534,891.9443302389855 -244.52532545570534,891.9443302389855 -295.02532545570534,891.9443302389855"
        fill="none"
        stroke="#cea500"
        strokeWidth="3.5"
        data-edge-id="reactflow__edge-DfrCkbD-HEHwLymv10zb5y2-thfnymb_UIiKxakKfiua5z1"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="0"
      ></path>
      <path
        d="M-234.02532545570534,1013.9443302389855 C-193.77532545570534,1013.9443302389855 -193.77532545570534,960.9443302389855 -153.52532545570534,960.9443302389855"
        fill="none"
        stroke="#cea500"
        strokeWidth="3.5"
        data-edge-id="reactflow__edge-MnDgQq9Vcxsu3wDqv5uh2z2-XL9XOV2h0BAuA5cFcM5L_y1"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="0.8 8"
      ></path>
      <path
        d="M-234.02532545570534,1013.9443302389855 C-193.77532545570534,1013.9443302389855 -193.77532545570534,1013.9443302389855 -153.52532545570534,1013.9443302389855"
        fill="none"
        stroke="#cea500"
        strokeWidth="3.5"
        data-edge-id="reactflow__edge-MnDgQq9Vcxsu3wDqv5uh2z2-RvDfKoa_HIW3QDBfkPv3my1"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="0.8 8"
      ></path>
      <path
        d="M-234.02532545570534,1013.9443302389855 C-193.77532545570534,1013.9443302389855 -193.77532545570534,1066.9443302389855 -153.52532545570534,1066.9443302389855"
        fill="none"
        stroke="#cea500"
        strokeWidth="3.5"
        data-edge-id="reactflow__edge-MnDgQq9Vcxsu3wDqv5uh2z2-kiCTo0U6VgNON8rv_Ktljy2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="0.8 8"
      ></path>
      <path
        d="M-376.52532545570534 1038.4443302389855L-376.52532545570534 1058.4443302389855L -376.52532545570534,1148.976431006493Q -376.52532545570534,1153.976431006493 -371.52532545570534,1153.976431006493L-235.60313927083638 1153.976431006493L-215.60313927083638 1153.976431006493"
        fill="none"
        stroke="#cea500"
        strokeWidth="3.5"
        data-edge-id="reactflow__edge-MnDgQq9Vcxsu3wDqv5uh2x2-nK1DhEXBKVhvSR1P_vzgjy2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="0"
      ></path>
      <path
        d="M-158.10313927083638,1178.476431006493 C-158.10313927083638,1197.726431006493 -158.10313927083638,1197.726431006493 -158.10313927083638,1216.976431006493"
        fill="none"
        stroke="#cea500"
        strokeWidth="3.5"
        data-edge-id="reactflow__edge-nK1DhEXBKVhvSR1P_vzgjx2--AKmITUmSGIflJG-eGkm5w1"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="0.8 8"
      ></path>
      <path
        d="M-100.60313927083638,1153.976431006493 C30.93576763672914,1153.976431006493 30.93576763672914,1153.976431006493 162.47467454429466,1153.976431006493"
        fill="none"
        stroke="#cea500"
        strokeWidth="3.5"
        data-edge-id="reactflow__edge-b4AP2OggxFAwsQtUwiUJJz2-nK1DhEXBKVhvSR1P_vzgjy1"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="0"
      ></path>
      <path
        d="M233.97467454429466,1129.476431006493 C233.97467454429466,1108.9603806227392 233.97467454429466,1108.9603806227392 233.97467454429466,1088.4443302389855"
        fill="none"
        stroke="#cea500"
        strokeWidth="3.5"
        data-edge-id="reactflow__edge-nK1DhEXBKVhvSR1P_vzgjw2-cQllxv7qGbRtM9O5llgN6x1"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="0.8 8"
      ></path>
      <path
        d="M233.97467454429466,1178.476431006493 C233.97467454429466,1196.4603806227392 233.97467454429466,1196.4603806227392 233.97467454429466,1214.4443302389855"
        fill="none"
        stroke="#cea500"
        strokeWidth="3.5"
        data-edge-id="reactflow__edge-nK1DhEXBKVhvSR1P_vzgjx2-zN7Ps1puD-YpHbKi1pHH8w1"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="0.8 8"
      ></path>
      <path
        d="M464.99469523818516,1129.476431006493 C464.99469523818516,1107.4603806227392 464.99469523818516,1107.4603806227392 464.99469523818516,1085.4443302389855"
        fill="none"
        stroke="#cea500"
        strokeWidth="3.5"
        data-edge-id="reactflow__edge-nK1DhEXBKVhvSR1P_vzgjw2-HdWq9ue0JdwmwqSIN2OD_x1"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="0.8 8"
      ></path>
      <path
        d="M305.47467454429466,1153.976431006493 C349.4846848912399,1153.976431006493 349.4846848912399,1153.976431006493 393.49469523818516,1153.976431006493"
        fill="none"
        stroke="#cea500"
        strokeWidth="3.5"
        data-edge-id="reactflow__edge-e_lwZ-a72-tAan2KDX6k3z2-nK1DhEXBKVhvSR1P_vzgjy2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="0"
      ></path>
      <path
        d="M464.99469523818516,1178.476431006493 C464.99469523818516,1280.7103806227392 464.99469523818516,1280.7103806227392 464.99469523818516,1382.9443302389855"
        fill="none"
        stroke="#cea500"
        strokeWidth="3.5"
        data-edge-id="reactflow__edge-W-atg_Msa9uPLr6RXAKSbx2-nK1DhEXBKVhvSR1P_vzgjw2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="0"
      ></path>
      <path
        d="M464.99469523818516,1431.9443302389855 C464.99469523818516,1453.0572558623721 464.99469523818516,1453.0572558623721 464.99469523818516,1474.1701814857588"
        fill="none"
        stroke="#cea500"
        strokeWidth="3.5"
        data-edge-id="reactflow__edge-nK1DhEXBKVhvSR1P_vzgjx2-_5ht0PAdVOJWPzTRS1mVgw1"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="0.8 8"
      ></path>
      <path
        d="M393.49469523818516,1407.4443302389855 C331.0939481443041,1407.4443302389855 331.0939481443041,1545.3287356248509 268.693201050423,1545.3287356248509"
        fill="none"
        stroke="#cea500"
        strokeWidth="3.5"
        data-edge-id="reactflow__edge-KHcC5pFN3qLnsbPPKpYd2y2-nK1DhEXBKVhvSR1P_vzgjz1"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="0"
      ></path>
      <path
        d="M175.693201050423,1520.8287356248509 C175.693201050423,1499.6434453307188 175.193201050423,1499.6434453307188 175.193201050423,1478.4581550365865"
        fill="none"
        stroke="#cea500"
        strokeWidth="3.5"
        data-edge-id="reactflow__edge-nK1DhEXBKVhvSR1P_vzgjw2-K3RZ8ESxWCpLKHePF87Hyx1"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="0.8 8"
      ></path>
      <path
        d="M82.693201050423,1545.3287356248509 C-0.6660622026411716,1545.3287356248509 -0.6660622026411716,1545.3287356248509 -84.02532545570534,1545.3287356248509"
        fill="none"
        stroke="#cea500"
        strokeWidth="3.5"
        data-edge-id="reactflow__edge-UNlvRp6k3_RDoTAAIEfJ1y2-ydxyne6RzIDPHij1Z3CsNz1"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="0"
      ></path>
      <path
        d="M-288.02532545570534 1545.3287356248509L-308.02532545570534 1545.3287356248509L -427.08952699071995,1545.3287356248509Q -432.08952699071995,1545.3287356248509 -432.08952699071995,1550.3287356248509L-432.08952699071995 1607.5845254232022L-432.08952699071995 1627.5845254232022"
        fill="none"
        stroke="#cea500"
        strokeWidth="3.5"
        data-edge-id="reactflow__edge-ydxyne6RzIDPHij1Z3CsNy2-bRpeoo9zXrnZ2IHSI7JX4w1"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="0"
      ></path>
      <path
        d="M-432.08952699071995,1676.5845254232022 C-432.08952699071995,1694.0660369358113 -432.08952699071995,1694.0660369358113 -432.08952699071995,1711.5475484484205"
        fill="none"
        stroke="#cea500"
        strokeWidth="3.5"
        data-edge-id="reactflow__edge-bRpeoo9zXrnZ2IHSI7JX4x2-H6-XGDjs4f-qbv13v5av0w2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="0.8 8"
      ></path>
      <path
        d="M-347.08952699071995,1652.0845254232022 C-279.8215466741824,1652.0845254232022 -279.8215466741824,1652.0845254232022 -212.55356635764488,1652.0845254232022"
        fill="none"
        stroke="#cea500"
        strokeWidth="3.5"
        data-edge-id="reactflow__edge-bRpeoo9zXrnZ2IHSI7JX4z2-gMHMjsh0i8paLZUH5mDX3y1"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="0"
      ></path>
      <g
        data-node-id="-AKmITUmSGIflJG-eGkm5"
        data-type="section"
        data-parent-id="b4AP2OggxFAwsQtUwiUJJ"
      >
        <rect
          x="-263.25313927083636"
          y="1218.3264310064928"
          width="235.3"
          height="215.3"
          rx="5"
          fill="#ffffff"
          stroke="#0ea5e9"
          strokeWidth="2.7"
        ></rect>
        <text
          x="-334.6031392708364"
          y="1208.976431006493"
          text-anchor="left"
          dominant-baseline="auto"
          font-size="17"
          fill="black"
        >
          <tspan></tspan>
        </text>
      </g>
      <g data-node-id="NiyRDadVpAFMzSVtgoFZ0" data-type="vertical">
        <line
          x1="-376.52532545570534"
          y1="810.9443302389855"
          x2="-376.52532545570534"
          y2="882.9443302389855"
          style={{
            strokeLinecap: 'round',
            strokeWidth: 3.75,
            stroke: '#cea500',
            strokeDasharray: '0.8 8',
          }}
        ></line>
      </g>
      <g data-node-id="sL8hbjRDbzA2bc9OzIfPe" data-type="vertical">
        <line
          x1="-376.52532545570534"
          y1="889.4443302389855"
          x2="-376.52532545570534"
          y2="1038.4443302389855"
          style={{
            strokeLinecap: 'round',
            strokeWidth: 3.75,
            stroke: '#cea500',
            strokeDasharray: '0',
          }}
        ></line>
      </g>
      <g data-node-id="n1TuNyZjK9CLAfbKRQENe" data-type="vertical">
        <line
          x1="101.54031453135002"
          y1="440.44433023898546"
          x2="101.54031453135002"
          y2="553.4443302389855"
          style={{
            strokeLinecap: 'round',
            strokeWidth: 3.5,
            stroke: '#cea500',
            strokeDasharray: '0.8 8',
          }}
        ></line>
      </g>
      <g data-node-id="NeJdgNbsxiUjt_GBzub6Z" data-type="section">
        <rect
          x="-247.17532545570535"
          y="276.2943302389855"
          width="245.3"
          height="165.3"
          rx="5"
          fill="#ffffff"
          stroke="#0ea5e9"
          strokeWidth="2.7"
        ></rect>
        <text
          x="-248.52532545570534"
          y="266.94433023898546"
          text-anchor="left"
          dominant-baseline="auto"
          font-size="14"
          fill="black"
        >
          <tspan></tspan>
        </text>
      </g>
      <g data-node-id="FkTj8n1pIAGa1nf93MUKC" data-type="section">
        <rect
          x="-4.175325455705343"
          y="275.7943302389855"
          width="158.3"
          height="166.3"
          rx="5"
          fill="#ffffff"
          stroke="#0ea5e9"
          strokeWidth="2.7"
        ></rect>
        <text
          x="-5.525325455705342"
          y="266.44433023898546"
          text-anchor="left"
          dominant-baseline="auto"
          font-size="14"
          fill="black"
        >
          <tspan></tspan>
        </text>
      </g>
      <g data-node-id="clS37EDia6KZVHCszqRqZ" data-type="vertical">
        <line
          x1="361.8414717224867"
          y1="235.94433023898546"
          x2="361.8414717224867"
          y2="319.94433023898546"
          style={{
            strokeLinecap: 'round',
            strokeWidth: 3.5,
            stroke: '#cea500',
            strokeDasharray: '0.8 8',
          }}
        ></line>
      </g>
      <g data-node-id="l4RmWQLIK1NOOm6QTQMBa" data-type="section">
        <rect
          x="-512.6753254557053"
          y="264.2943302389855"
          width="232.3"
          height="267.3"
          rx="5"
          fill="#ffffff"
          stroke="#0ea5e9"
          strokeWidth="2.7"
        ></rect>
        <text
          x="-514.0253254557053"
          y="254.94433023898546"
          text-anchor="left"
          dominant-baseline="auto"
          font-size="14"
          fill="black"
        >
          <tspan></tspan>
        </text>
      </g>
      <g
        data-node-id="tU4Umtnfu01t9gLlnlK6b"
        data-type="topic"
        data-title="CLI Tools"
        data-parent-id="XDvH2t3AJGevS17uM8TO6"
        data-parent-title="JavaScript Roadmap"
      >
        <rect
          x="-93.10968546864999"
          y="116.29433023898545"
          width="204.3"
          height="46.3"
          rx="5"
          fill="#d53f8c"
          stroke="white"
          strokeWidth="2.7"
          style={{ '--hover-color': '#d6d700' } as React.CSSProperties}
        ></rect>
        <text
          x="9.04031453135002"
          y="141.59433023898546"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="17"
          fill="#FFFFFF"
        >
          <tspan>CLI Tools</tspan>
        </text>
      </g>
      <g
        data-node-id="XDvH2t3AJGevS17uM8TO6"
        data-type="button"
        className="main-block"
        onClick={() => onNodeClick('XDvH2t3AJGevS17uM8TO6')}
      >
        <rect
          x="-93.10968546864999"
          y="4.294330238985458"
          width="204.3"
          height="46.3"
          rx="5"
          fill="#D53F8C"
          stroke="#D53F8C"
          strokeWidth="2.7"
        ></rect>
        <text
          x="9.04031453135002"
          y="29.594330238985457"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="17"
          fill="#ffffff"
        >
          <tspan>JavaScript Roadmap</tspan>
        </text>
      </g>
      <g
        data-node-id="y9ToYDix-koRbR6FLydFw"
        data-type="subtopic"
        data-title="Vite"
        data-parent-id="tU4Umtnfu01t9gLlnlK6b"
        data-parent-title="CLI Tools"
        onClick={() => onNodeClick('y9ToYDix-koRbR6FLydFw')}
        className="child-block"
      >
        <rect
          x="170.39484613528688"
          y="116.29433023898545"
          width="98.3"
          height="46.3"
          rx="5"
          fill="#0ea5e9"
          stroke="white"
          strokeWidth="2.7"
          style={{ '--hover-color': '#f3c950' } as React.CSSProperties}
        ></rect>
        <text
          x="219.5448461352869"
          y="141.59433023898546"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="17"
          fill="#FFFFFF"
        >
          <tspan>Vite</tspan>
        </text>
      </g>
      <g
        data-node-id="79K4xgljcoSHkCYI1D55O"
        data-type="topic"
        data-title="Components"
        data-parent-id="tU4Umtnfu01t9gLlnlK6b"
        data-parent-title="CLI Tools"
      >
        <rect
          x="-93.10968546864999"
          y="208.79433023898545"
          width="204.3"
          height="46.3"
          rx="5"
          fill="#d53f8c"
          stroke="white"
          strokeWidth="2.7"
          style={{ '--hover-color': '#d6d700' } as React.CSSProperties}
        ></rect>
        <text
          x="9.04031453135002"
          y="234.09433023898546"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="17"
          fill="#FFFFFF"
        >
          <tspan>Components</tspan>
        </text>
      </g>
      <g
        data-node-id="8mw4TxlLN4ZKAlLl-_NVV"
        data-type="subtopic"
        data-title="Functional Components"
        data-parent-id="79K4xgljcoSHkCYI1D55O"
        data-parent-title="Components"
        className="child-block"
        onClick={() => onNodeClick('8mw4TxlLN4ZKAlLl-_NVV')}
      >
        <rect
          x="-513.6753254557053"
          y="208.79433023898545"
          width="234.3"
          height="46.3"
          rx="5"
          fill="#0ea5e9"
          stroke="white"
          strokeWidth="2.7"
          style={{ '--hover-color': '#f3c950' } as React.CSSProperties}
        ></rect>
        <text
          x="-396.52532545570534"
          y="234.09433023898546"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="17"
          fill="#FFFFFF"
        >
          <tspan>Functional Components</tspan>
        </text>
      </g>
      <g
        data-node-id="HMTUjok_ZAcrP6YobWs3T"
        data-type="label"
        onClick={() => onNodeClick('HMTUjok_ZAcrP6YobWs3T')}
      >
        <text
          x="-496.02532545570534"
          y="513.9443302389855"
          text-anchor="left"
          dominant-baseline="auto"
          font-size="17"
          fill="black"
        >
          <tspan>Component Basics</tspan>
        </text>
      </g>
      <g
        data-node-id="WREBxWSNQDD_6fzpHL6CE"
        data-type="subtopic"
        data-title="JSX"
        onClick={() => onNodeClick('WREBxWSNQDD_6fzpHL6CE')}
        className="child-block"
      >
        <rect
          x="-504.6753254557053"
          y="272.2943302389855"
          width="216.3"
          height="46.3"
          rx="5"
          fill="#0ea5e9"
          stroke="white"
          strokeWidth="2.7"
          style={{ '--hover-color': '#f3c950' } as React.CSSProperties}
        ></rect>
        <text
          x="-396.52532545570534"
          y="297.59433023898544"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="17"
          fill="#FFFFFF"
        >
          <tspan>JSX</tspan>
        </text>
      </g>
      <g
        data-node-id="RFuy3Eho3mnW1GpP08BVw"
        data-type="subtopic"
        data-title="Props vs State"
        className="child-block"
        onClick={() => onNodeClick('RFuy3Eho3mnW1GpP08BVw')}
      >
        <rect
          x="-504.6753254557053"
          y="325.2943302389855"
          width="216.3"
          height="46.3"
          rx="5"
          fill="#0ea5e9"
          stroke="white"
          strokeWidth="2.7"
          style={{ '--hover-color': '#f3c950' } as React.CSSProperties}
        ></rect>
        <text
          x="-396.52532545570534"
          y="350.59433023898544"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="17"
          fill="#FFFFFF"
        >
          <tspan>Props vs State</tspan>
        </text>
      </g>
      <g
        data-node-id="aE6XBgH23135_9QmD4ff2"
        data-type="subtopic"
        data-title="Conditional Rendering"
        onClick={() => onNodeClick('aE6XBgH23135_9QmD4ff2')}
        className="child-block"
      >
        <rect
          x="-504.6753254557053"
          y="378.2943302389855"
          width="216.3"
          height="46.3"
          rx="5"
          fill="#0ea5e9"
          stroke="white"
          strokeWidth="2.7"
          style={{ '--hover-color': '#f3c950' } as React.CSSProperties}
        ></rect>
        <text
          x="-396.52532545570534"
          y="403.59433023898544"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="17"
          fill="#FFFFFF"
        >
          <tspan>Conditional Rendering</tspan>
        </text>
      </g>
      <g
        data-node-id="4T59gdcwdXqj9kCuK7cfp"
        data-type="subtopic"
        data-title="Composition"
        onClick={() => onNodeClick('4T59gdcwdXqj9kCuK7cfp')}
        className="child-block"
      >
        <rect
          x="-504.6753254557053"
          y="431.2943302389855"
          width="216.3"
          height="46.3"
          rx="5"
          fill="#0ea5e9"
          stroke="white"
          strokeWidth="2.7"
          style={{ '--hover-color': '#f3c950' } as React.CSSProperties}
        ></rect>
        <text
          x="-396.52532545570534"
          y="456.59433023898544"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="17"
          fill="#FFFFFF"
        >
          <tspan>Composition</tspan>
        </text>
      </g>
      <g
        data-node-id="0uiGsC5SWavNdlFqizkKe"
        data-type="topic"
        data-title="Rendering"
        data-parent-id="79K4xgljcoSHkCYI1D55O"
        data-parent-title="Components"
      >
        <rect
          x="299.39484613528685"
          y="208.79433023898545"
          width="127.3"
          height="46.3"
          rx="5"
          fill="#d53f8c"
          stroke="white"
          strokeWidth="2.7"
          style={{ '--hover-color': '#d6d700' } as React.CSSProperties}
        ></rect>
        <text
          x="363.04484613528683"
          y="234.09433023898546"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="17"
          fill="#FFFFFF"
        >
          <tspan>Rendering</tspan>
        </text>
      </g>
      <g
        data-node-id="8OBlgDRUg-CTgDXY-QHyO"
        data-type="subtopic"
        data-title="Component Lifecycle"
        onClick={() => onNodeClick('8OBlgDRUg-CTgDXY-QHyO')}
        className="child-block"
      >
        <rect
          x="306.8246745442947"
          y="279.7943302389855"
          width="231.3"
          height="46.3"
          rx="5"
          fill="#0ea5e9"
          stroke="white"
          strokeWidth="2.7"
          style={{ '--hover-color': '#f3c950' } as React.CSSProperties}
        ></rect>
        <text
          x="422.47467454429466"
          y="305.09433023898544"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="17"
          fill="#FFFFFF"
        >
          <tspan>Component Lifecycle</tspan>
        </text>
      </g>
      <g
        data-node-id="HeWVCPHqVnnbOn6zIim4K"
        data-type="subtopic"
        data-title="Lists and Keys"
        onClick={() => onNodeClick('HeWVCPHqVnnbOn6zIim4K')}
        className="child-block"
      >
        <rect
          x="306.8246745442947"
          y="332.7943302389855"
          width="231.3"
          height="46.3"
          rx="5"
          fill="#0ea5e9"
          stroke="white"
          strokeWidth="2.7"
          style={{ '--hover-color': '#f3c950' } as React.CSSProperties}
        ></rect>
        <text
          x="422.47467454429466"
          y="358.09433023898544"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="17"
          fill="#FFFFFF"
        >
          <tspan>Lists and Keys</tspan>
        </text>
      </g>
      <g
        data-node-id="vdumdIglnouf1KyGIGZnc"
        data-type="subtopic"
        data-title="Render Props"
        onClick={() => onNodeClick('vdumdIglnouf1KyGIGZnc')}
        className="child-block"
      >
        <rect
          x="306.8246745442947"
          y="385.7943302389855"
          width="231.3"
          height="46.3"
          rx="5"
          fill="#0ea5e9"
          stroke="white"
          strokeWidth="2.7"
          style={{ '--hover-color': '#f3c950' } as React.CSSProperties}
        ></rect>
        <text
          x="422.47467454429466"
          y="411.09433023898544"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="17"
          fill="#FFFFFF"
        >
          <tspan>Render Props</tspan>
        </text>
      </g>
      <g
        data-node-id="_zNAOhFWMcWqP4oxNPCXF"
        data-type="subtopic"
        data-title="Refs"
        onClick={() => onNodeClick('_zNAOhFWMcWqP4oxNPCXF')}
        className="child-block"
      >
        <rect
          x="306.8246745442947"
          y="438.7943302389855"
          width="231.3"
          height="46.3"
          rx="5"
          fill="#0ea5e9"
          stroke="white"
          strokeWidth="2.7"
          style={{ '--hover-color': '#f3c950' } as React.CSSProperties}
        ></rect>
        <text
          x="422.47467454429466"
          y="464.09433023898544"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="17"
          fill="#FFFFFF"
        >
          <tspan>Refs</tspan>
        </text>
      </g>
      <g
        data-node-id="Nex2HcTOYIbfqUzXyxSMY"
        data-type="subtopic"
        data-title="Events"
        onClick={() => onNodeClick('Nex2HcTOYIbfqUzXyxSMY')}
        className="child-block"
      >
        <rect
          x="306.8246745442947"
          y="491.7943302389855"
          width="231.3"
          height="46.3"
          rx="5"
          fill="#0ea5e9"
          stroke="white"
          strokeWidth="2.7"
          style={{ '--hover-color': '#f3c950' } as React.CSSProperties}
        ></rect>
        <text
          x="422.47467454429466"
          y="517.0943302389854"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="17"
          fill="#FFFFFF"
        >
          <tspan>Events</tspan>
        </text>
      </g>
      <g
        data-node-id="zOENl96GUZRw2PP2KxIck"
        data-type="subtopic"
        data-title="High Order Components"
        onClick={() => onNodeClick('zOENl96GUZRw2PP2KxIck')}
        className="child-block"
      >
        <rect
          x="306.8246745442947"
          y="544.7943302389855"
          width="231.3"
          height="46.3"
          rx="5"
          fill="#0ea5e9"
          stroke="white"
          strokeWidth="2.7"
          style={{ '--hover-color': '#f3c950' } as React.CSSProperties}
        ></rect>
        <text
          x="422.47467454429466"
          y="570.0943302389854"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="17"
          fill="#FFFFFF"
        >
          <tspan>High Order Components</tspan>
        </text>
      </g>
      <g
        data-node-id="LbLQhonBqzxHU6B-L--Vq"
        data-type="topic"
        data-title="Hooks"
        data-parent-id="0uiGsC5SWavNdlFqizkKe"
        data-parent-title="Rendering"
      >
        <rect
          x="58.39484613528689"
          y="542.9392656435051"
          width="110.3"
          height="46.3"
          rx="5"
          fill="#d53f8c"
          stroke="white"
          strokeWidth="2.7"
          style={{ '--hover-color': '#d6d700' } as React.CSSProperties}
        ></rect>
        <text
          x="113.54484613528689"
          y="568.2392656435051"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="17"
          fill="#FFFFFF"
        >
          <tspan>Hooks</tspan>
        </text>
      </g>
      <g
        data-node-id="mkmz1JuNsTOR1D4vqilCX"
        data-type="label"
        onClick={() => onNodeClick('mkmz1JuNsTOR1D4vqilCX')}
      >
        <text
          x="28.474674544294658"
          y="416.44433023898546"
          text-anchor="left"
          dominant-baseline="auto"
          font-size="17"
          fill="black"
        >
          <tspan>Basic Hooks</tspan>
        </text>
      </g>
      <g
        data-node-id="YEpkbNzEMzS6wAKg85J_N"
        data-type="subtopic"
        data-title="useState"
        onClick={() => onNodeClick('YEpkbNzEMzS6wAKg85J_N')}
        className="child-block"
      >
        <rect
          x="8.324674544294657"
          y="283.7943302389855"
          width="133.3"
          height="46.3"
          rx="5"
          fill="#0ea5e9"
          stroke="white"
          strokeWidth="2.7"
          style={{ '--hover-color': '#f3c950' } as React.CSSProperties}
        ></rect>
        <text
          x="74.97467454429466"
          y="309.09433023898544"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="17"
          fill="#FFFFFF"
        >
          <tspan>useState</tspan>
        </text>
      </g>
      <g
        data-node-id="8OnzX03hkZ9K9i__tjmFX"
        data-type="subtopic"
        data-title="useEffect"
        onClick={() => onNodeClick('8OnzX03hkZ9K9i__tjmFX')}
        className="child-block"
      >
        <rect
          x="6.324674544294657"
          y="336.7943302389855"
          width="137.3"
          height="46.3"
          rx="5"
          fill="#0ea5e9"
          stroke="white"
          strokeWidth="2.7"
          style={{ '--hover-color': '#f3c950' } as React.CSSProperties}
        ></rect>
        <text
          x="74.97467454429466"
          y="362.09433023898544"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="17"
          fill="#FFFFFF"
        >
          <tspan>useEffect</tspan>
        </text>
      </g>
      <g
        data-node-id="HX75SExuzR5AP7TQ94qid"
        data-type="subtopic"
        data-title="Creating Custom Hooks"
        data-parent-id="LbLQhonBqzxHU6B-L--Vq"
        data-parent-title="Hooks"
        onClick={() => onNodeClick('HX75SExuzR5AP7TQ94qid')}
        className="child-block"
      >
        <rect
          x="-248.60515386471317"
          y="522.4392656435051"
          width="246.3"
          height="46.3"
          rx="5"
          fill="#0ea5e9"
          stroke="white"
          strokeWidth="2.7"
          style={{ '--hover-color': '#f3c950' } as React.CSSProperties}
        ></rect>
        <text
          x="-125.45515386471317"
          y="547.7392656435051"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="17"
          fill="#FFFFFF"
        >
          <tspan>Creating Custom Hooks</tspan>
        </text>
      </g>
      <g
        data-node-id="EyspErq0ByXTgkgk3SGUz"
        data-type="label"
        onClick={() => onNodeClick('EyspErq0ByXTgkgk3SGUz')}
        className="child-block"
      >
        <text
          x="-185.52532545570534"
          y="502.14493540451963"
          text-anchor="left"
          dominant-baseline="auto"
          font-size="17"
          fill="black"
        >
          <tspan>Custom Hooks</tspan>
        </text>
      </g>
      <g
        data-node-id="dgoDNDtW2_q9R9yhkXrcz"
        data-type="subtopic"
        data-title="useCallback"
        onClick={() => onNodeClick('dgoDNDtW2_q9R9yhkXrcz')}
        className="child-block"
      >
        <rect
          x="-240.17532545570535"
          y="284.2943302389855"
          width="126.3"
          height="46.3"
          rx="5"
          fill="#0ea5e9"
          stroke="white"
          strokeWidth="2.7"
          style={{ '--hover-color': '#f3c950' } as React.CSSProperties}
        ></rect>
        <text
          x="-177.02532545570534"
          y="309.59433023898544"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="17"
          fill="#FFFFFF"
        >
          <tspan>useCallback</tspan>
        </text>
      </g>
      <g
        data-node-id="t_laNdMmdLApYszqXRdWg"
        data-type="subtopic"
        data-title="useRef"
        onClick={() => onNodeClick('t_laNdMmdLApYszqXRdWg')}
        className="child-block"
      >
        <rect
          x="-109.17532545570535"
          y="284.2943302389855"
          width="98.3"
          height="46.3"
          rx="5"
          fill="#0ea5e9"
          stroke="white"
          strokeWidth="2.7"
          style={{ '--hover-color': '#f3c950' } as React.CSSProperties}
        ></rect>
        <text
          x="-60.02532545570534"
          y="309.59433023898544"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="17"
          fill="#FFFFFF"
        >
          <tspan>useRef</tspan>
        </text>
      </g>
      <g
        data-node-id="w3bNp7OkehI1gjx8NzlC8"
        data-type="subtopic"
        data-title="useMemo"
        onClick={() => onNodeClick('w3bNp7OkehI1gjx8NzlC8')}
        className="child-block"
      >
        <rect
          x="-109.17532545570535"
          y="336.2943302389855"
          width="98.3"
          height="46.3"
          rx="5"
          fill="#0ea5e9"
          stroke="white"
          strokeWidth="2.7"
          style={{ '--hover-color': '#f3c950' } as React.CSSProperties}
        ></rect>
        <text
          x="-60.02532545570534"
          y="361.59433023898544"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="17"
          fill="#FFFFFF"
        >
          <tspan>useMemo</tspan>
        </text>
      </g>
      <g
        data-node-id="v48Mv0wQqjXbvy8x6gDjQ"
        data-type="subtopic"
        data-title="useReducer"
        onClick={() => onNodeClick('v48Mv0wQqjXbvy8x6gDjQ')}
        className="child-block"
      >
        <rect
          x="-240.17532545570535"
          y="336.2943302389855"
          width="126.3"
          height="46.3"
          rx="5"
          fill="#0ea5e9"
          stroke="white"
          strokeWidth="2.7"
          style={{ '--hover-color': '#f3c950' } as React.CSSProperties}
        ></rect>
        <text
          x="-177.02532545570534"
          y="361.59433023898544"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="17"
          fill="#FFFFFF"
        >
          <tspan>useReducer</tspan>
        </text>
      </g>
      <g
        data-node-id="D5_O-uElftYGQr_bTU_se"
        data-type="subtopic"
        data-title="useContext"
        onClick={() => onNodeClick('D5_O-uElftYGQr_bTU_se')}
        className="child-block"
      >
        <rect
          x="-239.17532545570535"
          y="388.2943302389855"
          width="228.3"
          height="46.3"
          rx="5"
          fill="#0ea5e9"
          stroke="white"
          strokeWidth="2.7"
          style={{ '--hover-color': '#f3c950' } as React.CSSProperties}
        ></rect>
        <text
          x="-125.02532545570534"
          y="413.59433023898544"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="17"
          fill="#FFFFFF"
        >
          <tspan>useContext</tspan>
        </text>
      </g>
      <g
        data-node-id="FK59Zsm5ENA9g11XWCan_"
        data-type="subtopic"
        data-title="useState"
        onClick={() => onNodeClick('FK59Zsm5ENA9g11XWCan_')}
        className="child-block"
      >
        <rect
          x="6.324674544294657"
          y="283.7943302389855"
          width="137.3"
          height="46.3"
          rx="5"
          fill="#0ea5e9"
          stroke="white"
          strokeWidth="2.7"
          style={{ '--hover-color': '#f3c950' } as React.CSSProperties}
        ></rect>
        <text
          x="74.97467454429466"
          y="309.09433023898544"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="17"
          fill="#FFFFFF"
        >
          <tspan>useState</tspan>
        </text>
      </g>
      <g
        data-node-id="mkyU0ug8MXxV4biHuOity"
        data-type="subtopic"
        data-title="Hooks Best Practices"
        data-parent-id="LbLQhonBqzxHU6B-L--Vq"
        data-parent-title="Hooks"
        onClick={() => onNodeClick('mkyU0ug8MXxV4biHuOity')}
        className="child-block"
      >
        <rect
          x="-248.60515386471317"
          y="575.4392656435051"
          width="246.3"
          height="46.3"
          rx="5"
          fill="#0ea5e9"
          stroke="white"
          strokeWidth="2.7"
          style={{ '--hover-color': '#f3c950' } as React.CSSProperties}
        ></rect>
        <text
          x="-125.45515386471317"
          y="600.7392656435051"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="17"
          fill="#FFFFFF"
        >
          <tspan>Hooks Best Practices</tspan>
        </text>
      </g>
      <g
        data-node-id="NStw6bi_pPB49K41BFSgo"
        data-type="topic"
        data-title="Routers"
        data-parent-id="LbLQhonBqzxHU6B-L--Vq"
        data-parent-title="Hooks"
      >
        <rect
          x="394.3246745442947"
          y="687.6474386815656"
          width="115.3"
          height="46.3"
          rx="5"
          fill="#d53f8c"
          stroke="white"
          strokeWidth="2.7"
          style={{ '--hover-color': '#d6d700' } as React.CSSProperties}
        ></rect>
        <text
          x="451.97467454429466"
          y="712.9474386815656"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="17"
          fill="#FFFFFF"
        >
          <tspan>Routers</tspan>
        </text>
      </g>
      <g
        data-node-id="zWL8VLx_g0SWubavJDs6i"
        data-type="subtopic"
        data-title="Tanstack Router"
        onClick={() => onNodeClick('zWL8VLx_g0SWubavJDs6i')}
        className="child-block"
      >
        <rect
          x="365.3246745442947"
          y="827.1474386815656"
          width="173.3"
          height="46.3"
          rx="5"
          fill="#0ea5e9"
          stroke="white"
          strokeWidth="2.7"
          style={{ '--hover-color': '#f3c950' } as React.CSSProperties}
        ></rect>
        <text
          x="451.97467454429466"
          y="852.4474386815656"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="17"
          fill="#FFFFFF"
        >
          <tspan>Tanstack Router</tspan>
        </text>
      </g>
      <g
        data-node-id="jvp43wFkKlGQX2y7IxkbM"
        data-type="subtopic"
        data-title="React Router"
        data-parent-id="NStw6bi_pPB49K41BFSgo"
        data-parent-title="Routers"
        onClick={() => onNodeClick('jvp43wFkKlGQX2y7IxkbM')}
        className="child-block"
      >
        <rect
          x="365.3246745442947"
          y="774.1474386815656"
          width="173.3"
          height="46.3"
          rx="5"
          fill="#0ea5e9"
          stroke="white"
          strokeWidth="2.7"
          style={{ '--hover-color': '#f3c950' } as React.CSSProperties}
        ></rect>
        <text
          x="451.97467454429466"
          y="799.4474386815656"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="17"
          fill="#FFFFFF"
        >
          <tspan>React Router</tspan>
        </text>
      </g>
      <g
        data-node-id="I7_mX4h-Yywp1YyTJRKXI"
        data-type="topic"
        data-title="State Management"
        data-parent-id="NStw6bi_pPB49K41BFSgo"
        data-parent-title="Routers"
      >
        <rect
          x="51.043201050423"
          y="868.7943302389855"
          width="190.3"
          height="46.3"
          rx="5"
          fill="#d53f8c"
          stroke="white"
          strokeWidth="2.7"
          style={{ '--hover-color': '#d6d700' } as React.CSSProperties}
        ></rect>
        <text
          x="146.193201050423"
          y="894.0943302389854"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="17"
          fill="#FFFFFF"
        >
          <tspan>State Management</tspan>
        </text>
      </g>
      <g
        data-node-id="10uL0r388lKh8pWYWqRZD"
        data-type="subtopic"
        data-title="Context"
        onClick={() => onNodeClick('10uL0r388lKh8pWYWqRZD')}
        className="child-block"
      >
        <rect
          x="84.043201050423"
          y="737.2943302389855"
          width="124.3"
          height="46.3"
          rx="5"
          fill="#0ea5e9"
          stroke="white"
          strokeWidth="2.7"
          style={{ '--hover-color': '#f3c950' } as React.CSSProperties}
        ></rect>
        <text
          x="146.193201050423"
          y="762.5943302389854"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="17"
          fill="#FFFFFF"
        >
          <tspan>Context</tspan>
        </text>
      </g>
      <g
        data-node-id="yI6XiNW04EL78UL4lkVgd"
        data-type="subtopic"
        data-title="Jotai"
        data-parent-id="I7_mX4h-Yywp1YyTJRKXI"
        data-parent-title="State Management"
        onClick={() => onNodeClick('yI6XiNW04EL78UL4lkVgd')}
        className="child-block"
      >
        <rect
          x="84.043201050423"
          y="793.2943302389855"
          width="124.3"
          height="46.3"
          rx="5"
          fill="#0ea5e9"
          stroke="white"
          strokeWidth="2.7"
          style={{ '--hover-color': '#f3c950' } as React.CSSProperties}
        ></rect>
        <text
          x="146.193201050423"
          y="818.5943302389854"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="17"
          fill="#FFFFFF"
        >
          <tspan>Jotai</tspan>
        </text>
      </g>
      <g
        data-node-id="DfrCkbD-HEHwLymv10zb5"
        data-type="topic"
        data-title="Writing CSS"
        data-parent-id="KO3viVIJJREtxXxsocN7j"
        data-parent-title="Tailwind CSS"
      >
        <rect
          x="-192.67532545570535"
          y="868.7943302389855"
          width="134.3"
          height="46.3"
          rx="5"
          fill="#d53f8c"
          stroke="white"
          strokeWidth="2.7"
          style={{ '--hover-color': '#d6d700' } as React.CSSProperties}
        ></rect>
        <text
          x="-125.52532545570534"
          y="894.0943302389854"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="17"
          fill="#FFFFFF"
        >
          <tspan>Writing CSS</tspan>
        </text>
      </g>
      <g
        data-node-id="MnDgQq9Vcxsu3wDqv5uh2"
        data-type="topic"
        data-title="Headless Component Libraries"
      >
        <rect
          x="-517.6753254557053"
          y="990.7943302389855"
          width="282.3"
          height="46.3"
          rx="5"
          fill="#d53f8c"
          stroke="white"
          strokeWidth="2.7"
          style={{ '--hover-color': '#d6d700' } as React.CSSProperties}
        ></rect>
        <text
          x="-376.52532545570534"
          y="1016.0943302389854"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="17"
          fill="#FFFFFF"
        >
          <tspan>Headless Component Libraries</tspan>
        </text>
      </g>
      <g
        data-node-id="KO3viVIJJREtxXxsocN7j"
        data-type="subtopic"
        data-title="Tailwind CSS"
        onClick={() => onNodeClick('KO3viVIJJREtxXxsocN7j')}
        className="child-block"
      >
        <rect
          x="-198.67532545570535"
          y="791.2943302389855"
          width="146.3"
          height="46.3"
          rx="5"
          fill="#0ea5e9"
          stroke="white"
          strokeWidth="2.7"
          style={{ '--hover-color': '#f3c950' } as React.CSSProperties}
        ></rect>
        <text
          x="-125.52532545570534"
          y="816.5943302389854"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="17"
          fill="#FFFFFF"
        >
          <tspan>Tailwind CSS</tspan>
        </text>
      </g>
      <g
        data-node-id="thfnymb_UIiKxakKfiua5"
        data-type="topic"
        data-title="Component / Libraries"
        data-parent-id="DfrCkbD-HEHwLymv10zb5"
        data-parent-title="Writing CSS"
      >
        <rect
          x="-513.6753254557053"
          y="868.7943302389855"
          width="217.3"
          height="46.3"
          rx="5"
          fill="#d53f8c"
          stroke="white"
          strokeWidth="2.7"
          style={{ '--hover-color': '#d6d700' } as React.CSSProperties}
        ></rect>
        <text
          x="-405.02532545570534"
          y="894.0943302389854"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="17"
          fill="#FFFFFF"
        >
          <tspan>Component / Libraries</tspan>
        </text>
      </g>
      <g
        data-node-id="uqphqAnlcJOLnwHZs5jWu"
        data-type="subtopic"
        data-title="Bootstrap"
        onClick={() => onNodeClick('uqphqAnlcJOLnwHZs5jWu')}
        className="child-block"
      >
        <rect
          x="-452.1753254557053"
          y="726.2943302389855"
          width="135.3"
          height="46.3"
          rx="5"
          fill="#0ea5e9"
          stroke="white"
          strokeWidth="2.7"
          style={{ '--hover-color': '#f3c950' } as React.CSSProperties}
        ></rect>
        <text
          x="-384.52532545570534"
          y="751.5943302389854"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="17"
          fill="#FFFFFF"
        >
          <tspan>Bootstrap</tspan>
        </text>
      </g>
      <g
        data-node-id="gy7eBxPOlwG8BvxHVLDQ9"
        data-type="subtopic"
        data-title="Material UI"
        onClick={() => onNodeClick('gy7eBxPOlwG8BvxHVLDQ9')}
        className="child-block"
      >
        <rect
          x="-452.1753254557053"
          y="673.2943302389855"
          width="135.3"
          height="46.3"
          rx="5"
          fill="#0ea5e9"
          stroke="white"
          strokeWidth="2.7"
          style={{ '--hover-color': '#f3c950' } as React.CSSProperties}
        ></rect>
        <text
          x="-384.52532545570534"
          y="698.5943302389854"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="17"
          fill="#FFFFFF"
        >
          <tspan>Material UI</tspan>
        </text>
      </g>
      <g
        data-node-id="njKsYNkwTXPQ1NjlGKXab"
        data-type="subtopic"
        data-title="Shadcn UI"
        onClick={() => onNodeClick('njKsYNkwTXPQ1NjlGKXab')}
        className="child-block"
      >
        <rect
          x="-452.1753254557053"
          y="779.2943302389855"
          width="135.3"
          height="46.3"
          rx="5"
          fill="#0ea5e9"
          stroke="white"
          strokeWidth="2.7"
          style={{ '--hover-color': '#f3c950' } as React.CSSProperties}
        ></rect>
        <text
          x="-384.52532545570534"
          y="804.5943302389854"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="17"
          fill="#FFFFFF"
        >
          <tspan>Shadcn UI</tspan>
        </text>
      </g>
      <g
        data-node-id="awoEhwPKjUcR84XGL6Som"
        data-type="subtopic"
        data-title="CSS Modules"
        onClick={() => onNodeClick('awoEhwPKjUcR84XGL6Som')}
        className="child-block"
      >
        <rect
          x="-198.67532545570535"
          y="738.2943302389855"
          width="146.3"
          height="46.3"
          rx="5"
          fill="#0ea5e9"
          stroke="white"
          strokeWidth="2.7"
          style={{ '--hover-color': '#f3c950' } as React.CSSProperties}
        ></rect>
        <text
          x="-125.52532545570534"
          y="763.5943302389854"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="17"
          fill="#FFFFFF"
        >
          <tspan>CSS Modules</tspan>
        </text>
      </g>
      <g
        data-node-id="XL9XOV2h0BAuA5cFcM5L_"
        data-type="subtopic"
        data-title="Radix UI"
        data-parent-id="MnDgQq9Vcxsu3wDqv5uh2"
        data-parent-title="Headless Component Libraries"
        onClick={() => onNodeClick('XL9XOV2h0BAuA5cFcM5L_')}
        className="child-block"
      >
        <rect
          x="-152.17532545570535"
          y="937.7943302389855"
          width="172.3"
          height="46.3"
          rx="5"
          fill="#0ea5e9"
          stroke="white"
          strokeWidth="2.7"
          style={{ '--hover-color': '#f3c950' } as React.CSSProperties}
        ></rect>
        <text
          x="-66.02532545570534"
          y="963.0943302389854"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="17"
          fill="#FFFFFF"
        >
          <tspan>Radix UI</tspan>
        </text>
      </g>
      <g
        data-node-id="RvDfKoa_HIW3QDBfkPv3m"
        data-type="subtopic"
        data-title="React Aria"
        data-parent-id="MnDgQq9Vcxsu3wDqv5uh2"
        data-parent-title="Headless Component Libraries"
        onClick={() => onNodeClick('RvDfKoa_HIW3QDBfkPv3m')}
        className="child-block"
      >
        <rect
          x="-152.17532545570535"
          y="990.7943302389855"
          width="172.3"
          height="46.3"
          rx="5"
          fill="#0ea5e9"
          stroke="white"
          strokeWidth="2.7"
          style={{ '--hover-color': '#f3c950' } as React.CSSProperties}
        ></rect>
        <text
          x="-66.02532545570534"
          y="1016.0943302389854"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="17"
          fill="#FFFFFF"
        >
          <tspan>React Aria</tspan>
        </text>
      </g>
      <g
        data-node-id="kiCTo0U6VgNON8rv_Ktlj"
        data-type="subtopic"
        data-title="Ark UI"
        data-parent-id="MnDgQq9Vcxsu3wDqv5uh2"
        data-parent-title="Headless Component Libraries"
        onClick={() => onNodeClick('kiCTo0U6VgNON8rv_Ktlj')}
        className="child-block"
      >
        <rect
          x="-152.17532545570535"
          y="1043.7943302389854"
          width="172.3"
          height="46.3"
          rx="5"
          fill="#0ea5e9"
          stroke="white"
          strokeWidth="2.7"
          style={{ '--hover-color': '#f3c950' } as React.CSSProperties}
        ></rect>
        <text
          x="-66.02532545570534"
          y="1069.0943302389855"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="17"
          fill="#FFFFFF"
        >
          <tspan>Ark UI</tspan>
        </text>
      </g>
      <g
        data-node-id="b4AP2OggxFAwsQtUwiUJJ"
        data-type="topic"
        data-title="API Calls"
        data-parent-id="MnDgQq9Vcxsu3wDqv5uh2"
        data-parent-title="Headless Component Libraries"
      >
        <rect
          x="-214.25313927083639"
          y="1130.8264310064928"
          width="112.3"
          height="46.3"
          rx="5"
          fill="#d53f8c"
          stroke="white"
          strokeWidth="2.7"
          style={{ '--hover-color': '#d6d700' } as React.CSSProperties}
        ></rect>
        <text
          x="-158.10313927083638"
          y="1156.126431006493"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="17"
          fill="#FFFFFF"
        >
          <tspan>API Calls</tspan>
        </text>
      </g>
      <g
        data-node-id="5EPmbiNdP_vhIXclv_GjV"
        data-type="subtopic"
        data-title="Tanstack Query"
        onClick={() => onNodeClick('5EPmbiNdP_vhIXclv_GjV')}
        className="child-block"
      >
        <rect
          x="-247.25313927083639"
          y="1229.8264310064928"
          width="202.3"
          height="46.3"
          rx="5"
          fill="#0ea5e9"
          stroke="white"
          strokeWidth="2.7"
          style={{ '--hover-color': '#f3c950' } as React.CSSProperties}
        ></rect>
        <text
          x="-146.10313927083638"
          y="1255.126431006493"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="17"
          fill="#FFFFFF"
        >
          <tspan>Tanstack Query</tspan>
        </text>
      </g>
      <g
        data-node-id="ElqWQClryfSYdL7P_mgYK"
        data-type="subtopic"
        data-title="Axios"
        onClick={() => onNodeClick('ElqWQClryfSYdL7P_mgYK')}
        className="child-block"
      >
        <rect
          x="-247.25313927083639"
          y="1283.3264310064928"
          width="202.3"
          height="46.3"
          rx="5"
          fill="#0ea5e9"
          stroke="white"
          strokeWidth="2.7"
          style={{ '--hover-color': '#f3c950' } as React.CSSProperties}
        ></rect>
        <text
          x="-145.60313927083638"
          y="1308.626431006493"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="17"
          fill="#FFFFFF"
        >
          <tspan>Axios</tspan>
        </text>
      </g>
      <g
        data-node-id="h49-tjEkKcq7d7ikRHIOx"
        data-type="subtopic"
        data-title="rtk-query"
        onClick={() => onNodeClick('h49-tjEkKcq7d7ikRHIOx')}
        className="child-block"
      >
        <rect
          x="-247.25313927083639"
          y="1336.3264310064928"
          width="203.3"
          height="46.3"
          rx="5"
          fill="#0ea5e9"
          stroke="white"
          strokeWidth="2.7"
          style={{ '--hover-color': '#f3c950' } as React.CSSProperties}
        ></rect>
        <text
          x="-145.60313927083638"
          y="1361.626431006493"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="17"
          fill="#FFFFFF"
        >
          <tspan>rtk-query</tspan>
        </text>
      </g>
      <g data-node-id="KNAlIYCENB4VMuQGqJNk3" data-type="label">
        <text
          x="-165.60313927083638"
          y="1414.476431006493"
          text-anchor="left"
          dominant-baseline="auto"
          font-size="17"
          fill="black"
        >
          <tspan>REST</tspan>
        </text>
      </g>
      <g
        data-node-id="e_lwZ-a72-tAan2KDX6k3"
        data-type="topic"
        data-title="Testing"
        data-parent-id="b4AP2OggxFAwsQtUwiUJJ"
        data-parent-title="API Calls"
      >
        <rect
          x="163.82467454429465"
          y="1130.8264310064928"
          width="140.3"
          height="46.3"
          rx="5"
          fill="#d53f8c"
          stroke="white"
          strokeWidth="2.7"
          style={{ '--hover-color': '#d6d700' } as React.CSSProperties}
        ></rect>
        <text
          x="233.97467454429466"
          y="1156.126431006493"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="17"
          fill="#FFFFFF"
        >
          <tspan>Testing</tspan>
        </text>
      </g>
      <g
        data-node-id="opa61u9gYgSpoPtxp58wu"
        data-type="subtopic"
        data-title="Jest"
        onClick={() => onNodeClick('opa61u9gYgSpoPtxp58wu')}
        className="child-block"
      >
        <rect
          x="136.32467454429465"
          y="987.7943302389855"
          width="195.3"
          height="46.3"
          rx="5"
          fill="#0ea5e9"
          stroke="white"
          strokeWidth="2.7"
          style={{ '--hover-color': '#f3c950' } as React.CSSProperties}
        ></rect>
        <text
          x="233.97467454429466"
          y="1013.0943302389854"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="17"
          fill="#FFFFFF"
        >
          <tspan>Jest</tspan>
        </text>
      </g>
      <g
        data-node-id="cQllxv7qGbRtM9O5llgN6"
        data-type="subtopic"
        data-title="react-testing-library"
        data-parent-id="e_lwZ-a72-tAan2KDX6k3"
        data-parent-title="Testing"
        onClick={() => onNodeClick('cQllxv7qGbRtM9O5llgN6')}
        className="child-block"
      >
        <rect
          x="136.32467454429465"
          y="1040.7943302389854"
          width="195.3"
          height="46.3"
          rx="5"
          fill="#0ea5e9"
          stroke="white"
          strokeWidth="2.7"
          style={{ '--hover-color': '#f3c950' } as React.CSSProperties}
        ></rect>
        <text
          x="233.97467454429466"
          y="1066.0943302389855"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="17"
          fill="#FFFFFF"
        >
          <tspan>react-testing-library</tspan>
        </text>
      </g>
      <g
        data-node-id="zN7Ps1puD-YpHbKi1pHH8"
        data-type="subtopic"
        data-title="Cypress"
        data-parent-id="e_lwZ-a72-tAan2KDX6k3"
        data-parent-title="Testing"
        onClick={() => onNodeClick('zN7Ps1puD-YpHbKi1pHH8')}
        className="child-block"
      >
        <rect
          x="157.82467454429465"
          y="1215.7943302389854"
          width="152.3"
          height="46.3"
          rx="5"
          fill="#0ea5e9"
          stroke="white"
          strokeWidth="2.7"
          style={{ '--hover-color': '#f3c950' } as React.CSSProperties}
        ></rect>
        <text
          x="233.97467454429466"
          y="1241.0943302389855"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="17"
          fill="#FFFFFF"
        >
          <tspan>Cypress</tspan>
        </text>
      </g>
      <g
        data-node-id="W-atg_Msa9uPLr6RXAKSb"
        data-type="topic"
        data-title="Frameworks"
        data-parent-id="e_lwZ-a72-tAan2KDX6k3"
        data-parent-title="Testing"
      >
        <rect
          x="394.8446952381852"
          y="1130.8264310064928"
          width="140.3"
          height="46.3"
          rx="5"
          fill="#d53f8c"
          stroke="white"
          strokeWidth="2.7"
          style={{ '--hover-color': '#d6d700' } as React.CSSProperties}
        ></rect>
        <text
          x="464.99469523818516"
          y="1156.126431006493"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="17"
          fill="#FFFFFF"
        >
          <tspan>Frameworks</tspan>
        </text>
      </g>
      <g
        data-node-id="HdWq9ue0JdwmwqSIN2OD_"
        data-type="subtopic"
        data-title="Next.js"
        data-parent-id="W-atg_Msa9uPLr6RXAKSb"
        data-parent-title="Frameworks"
        onClick={() => onNodeClick('HdWq9ue0JdwmwqSIN2OD_')}
        className="child-block"
      >
        <rect
          x="396.8446952381852"
          y="1037.7943302389854"
          width="136.3"
          height="46.3"
          rx="5"
          fill="#0ea5e9"
          stroke="white"
          strokeWidth="2.7"
          style={{ '--hover-color': '#f3c950' } as React.CSSProperties}
        ></rect>
        <text
          x="464.99469523818516"
          y="1063.0943302389855"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="17"
          fill="#FFFFFF"
        >
          <tspan>Next.js</tspan>
        </text>
      </g>
      <g
        data-node-id="KHcC5pFN3qLnsbPPKpYd2"
        data-type="topic"
        data-title="Forms"
        data-parent-id="W-atg_Msa9uPLr6RXAKSb"
        data-parent-title="Frameworks"
      >
        <rect
          x="394.8446952381852"
          y="1384.2943302389854"
          width="140.3"
          height="46.3"
          rx="5"
          fill="#d53f8c"
          stroke="white"
          strokeWidth="2"
          style={{ '--hover-color': '#d6d700' } as React.CSSProperties}
        ></rect>
        <text
          x="464.99469523818516"
          y="1409.5943302389855"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="17"
          fill="#FFFFFF"
        >
          <tspan>Forms</tspan>
        </text>
      </g>
      <g
        data-node-id="_5ht0PAdVOJWPzTRS1mVg"
        data-type="subtopic"
        data-title="React Hook Form"
        data-parent-id="KHcC5pFN3qLnsbPPKpYd2"
        data-parent-title="Forms"
        onClick={() => onNodeClick('_5ht0PAdVOJWPzTRS1mVg')}
        className="child-block"
      >
        <rect
          x="375.8446952381852"
          y="1475.5201814857587"
          width="178.3"
          height="46.3"
          rx="5"
          fill="#0ea5e9"
          stroke="white"
          strokeWidth="2.7"
          style={{ '--hover-color': '#f3c950' } as React.CSSProperties}
        ></rect>
        <text
          x="464.99469523818516"
          y="1500.820181485759"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="17"
          fill="#FFFFFF"
        >
          <tspan>React Hook Form</tspan>
        </text>
      </g>
      <g
        data-node-id="UNlvRp6k3_RDoTAAIEfJ1"
        data-type="topic"
        data-title="Types &amp; Validation"
        data-parent-id="KHcC5pFN3qLnsbPPKpYd2"
        data-parent-title="Forms"
      >
        <rect
          x="84.043201050423"
          y="1522.1787356248508"
          width="183.3"
          height="46.3"
          rx="5"
          fill="#d53f8c"
          stroke="white"
          strokeWidth="2.7"
          style={{ '--hover-color': '#d6d700' } as React.CSSProperties}
        ></rect>
        <text
          x="175.693201050423"
          y="1547.478735624851"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="17"
          fill="#FFFFFF"
        >
          <tspan>Types &amp; Validation</tspan>
        </text>
      </g>
      <g
        data-node-id="ElgRwv5LSVg5FXGx-2K2s"
        data-type="subtopic"
        data-title="TypeScript"
        onClick={() => onNodeClick('ElgRwv5LSVg5FXGx-2K2s')}
        className="child-block"
      >
        <rect
          x="101.543201050423"
          y="1379.8081550365864"
          width="147.3"
          height="44.3"
          rx="5"
          fill="#0ea5e9"
          stroke="white"
          strokeWidth="2.7"
          style={{ '--hover-color': '#f3c950' } as React.CSSProperties}
        ></rect>
        <text
          x="175.193201050423"
          y="1404.1081550365866"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="17"
          fill="#FFFFFF"
        >
          <tspan>TypeScript</tspan>
        </text>
      </g>
      <g
        data-node-id="K3RZ8ESxWCpLKHePF87Hy"
        data-type="subtopic"
        data-title="Zod"
        data-parent-id="UNlvRp6k3_RDoTAAIEfJ1"
        data-parent-title="Types &amp; Validation"
        onClick={() => onNodeClick('K3RZ8ESxWCpLKHePF87Hy')}
        className="child-block"
      >
        <rect
          x="101.543201050423"
          y="1430.8081550365864"
          width="147.3"
          height="46.3"
          rx="5"
          fill="#0ea5e9"
          stroke="white"
          strokeWidth="2.7"
          style={{ '--hover-color': '#f3c950' } as React.CSSProperties}
        ></rect>
        <text
          x="175.193201050423"
          y="1456.1081550365866"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="17"
          fill="#FFFFFF"
        >
          <tspan>Zod</tspan>
        </text>
      </g>
      <g data-node-id="ydxyne6RzIDPHij1Z3CsN" data-type="paragraph">
        <rect
          x="-286.77532545570534"
          y="1513.0787356248509"
          width="204"
          height="64.5"
          rx="5"
          fill="transparent"
          stroke="transparent"
          strokeWidth="2.5"
        ></rect>
        <text fill="#000000">
          <tspan
            x="-186.02532545570534"
            y="1544.0787356248509"
            dy="0"
            text-anchor="middle"
            dominant-baseline="middle"
            font-size="20"
          >
            Advanced Topics
          </tspan>
        </text>
      </g>
      <g
        data-node-id="bRpeoo9zXrnZ2IHSI7JX4"
        data-type="topic"
        data-title="Animation"
        data-parent-id="ydxyne6RzIDPHij1Z3CsN"
        data-parent-title="Advanced Topics"
      >
        <rect
          x="-515.7395269907199"
          y="1628.934525423202"
          width="167.3"
          height="46.3"
          rx="5"
          fill="#d53f8c"
          stroke="white"
          strokeWidth="2.7"
          style={{ '--hover-color': '#d6d700' } as React.CSSProperties}
        ></rect>
        <text
          x="-432.08952699071995"
          y="1654.2345254232023"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="17"
          fill="#FFFFFF"
        >
          <tspan>Animation</tspan>
        </text>
      </g>
      <g
        data-node-id="SUeXDkmOLipdRP4fSrZOH"
        data-type="topic"
        data-title="Server APIs"
        onClick={() => onNodeClick('H6-XGDjs4f-qbv13v5av0')}
        className="main-block"
      >
        <rect
          x="-211.2035663576449"
          y="1681.934525423202"
          width="175.3"
          height="46.3"
          rx="5"
          fill="#d53f8c"
          stroke="white"
          strokeWidth="2.7"
          style={{ '--hover-color': '#d6d700' } as React.CSSProperties}
        ></rect>
        <text
          x="-123.55356635764488"
          y="1707.2345254232023"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="17"
          fill="#FFFFFF"
        >
          <tspan>Server APIs</tspan>
        </text>
      </g>
      <g
        data-node-id="H6-XGDjs4f-qbv13v5av0"
        data-type="subtopic"
        data-title="Framer Motion"
        data-parent-id="bRpeoo9zXrnZ2IHSI7JX4"
        data-parent-title="Animation"
        onClick={() => onNodeClick('H6-XGDjs4f-qbv13v5av0')}
        className="child-block"
      >
        <rect
          x="-515.7395269907199"
          y="1712.8975484484204"
          width="167.3"
          height="46.3"
          rx="5"
          fill="#0ea5e9"
          stroke="white"
          strokeWidth="2.7"
          style={{ '--hover-color': '#f3c950' } as React.CSSProperties}
        ></rect>
        <text
          x="-432.08952699071995"
          y="1738.1975484484205"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="17"
          fill="#FFFFFF"
        >
          <tspan>Framer Motion</tspan>
        </text>
      </g>
      <g
        data-node-id="_F3WMxhzaK9F8_-zHDDMF"
        data-type="topic"
        data-title="Suspense"
        onClick={() => onNodeClick('_F3WMxhzaK9F8_-zHDDMF')}
        className="main-block"
      >
        <rect
          x="-211.2035663576449"
          y="1734.934525423202"
          width="175.3"
          height="46.3"
          rx="5"
          fill="#d53f8c"
          stroke="white"
          strokeWidth="2.7"
          style={{ '--hover-color': '#d6d700' } as React.CSSProperties}
        ></rect>
        <text
          x="-123.55356635764488"
          y="1760.2345254232023"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="17"
          fill="#FFFFFF"
        >
          <tspan>Suspense</tspan>
        </text>
      </g>
      <g
        data-node-id="DcDggX4OmmwvJGHwuV86t"
        data-type="topic"
        data-title="Portals"
        onClick={() => onNodeClick('DcDggX4OmmwvJGHwuV86t')}
        className="main-block"
      >
        <rect
          x="-211.2035663576449"
          y="1787.934525423202"
          width="175.3"
          height="46.3"
          rx="5"
          fill="#d53f8c"
          stroke="white"
          strokeWidth="2.7"
          style={{ '--hover-color': '#d6d700' } as React.CSSProperties}
        ></rect>
        <text
          x="-123.55356635764488"
          y="1813.2345254232023"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="17"
          fill="#FFFFFF"
        >
          <tspan>Portals</tspan>
        </text>
      </g>
      <g
        data-node-id="gMHMjsh0i8paLZUH5mDX3"
        data-type="topic"
        data-title="Error Boundaries"
        data-parent-id="bRpeoo9zXrnZ2IHSI7JX4"
        data-parent-title="Animation"
        onClick={() => onNodeClick('gMHMjsh0i8paLZUH5mDX3')}
        className="main-block"
      >
        <rect
          x="-211.2035663576449"
          y="1628.934525423202"
          width="175.3"
          height="46.3"
          rx="5"
          fill="#d53f8c"
          stroke="white"
          strokeWidth="2.7"
          style={{ '--hover-color': '#d6d700' } as React.CSSProperties}
        ></rect>
        <text
          x="-123.55356635764488"
          y="1654.2345254232023"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="17"
          fill="#FFFFFF"
        >
          <tspan>Error Boundaries</tspan>
        </text>
      </g>
      <circle
        cx="269.0448461352869"
        cy="138.94433023898546"
        r="9.5"
        fill="#16a34a"
        id="icon-link"
        display={isCompleted('y9ToYDix-koRbR6FLydFw') ? 'block' : 'none'}
      ></circle>
      <path
        d="M265.0448461352869 138.94433023898546L267.5448461352869 141.94433023898546 272.5448461352869 136.94433023898546"
        fill="none"
        stroke="#fff"
        stroke-width="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        display={isCompleted('y9ToYDix-koRbR6FLydFw') ? 'block' : 'none'}
      ></path>
      <circle
        cx="-514.5253254557053"
        cy="231.44433023898546"
        r="9.5"
        fill="#16a34a"
        id="icon-link"
        display={isCompleted('8mw4TxlLN4ZKAlLl-_NVV') ? 'block' : 'none'}
      ></circle>
      <path
        d="M-518.5253254557053 231.44433023898546L-516.0253254557053 234.44433023898546 -511.02532545570534 229.44433023898546"
        fill="none"
        stroke="#fff"
        stroke-width="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        display={isCompleted('8mw4TxlLN4ZKAlLl-_NVV') ? 'block' : 'none'}
      ></path>
      <circle
        cx="-505.52532545570534"
        cy="294.94433023898546"
        r="9.5"
        fill="#16a34a"
        id="icon-link"
        display={isCompleted('WREBxWSNQDD_6fzpHL6CE') ? 'block' : 'none'}
      ></circle>
      <path
        d="M-509.52532545570534 294.94433023898546L-507.02532545570534 297.94433023898546 -502.02532545570534 292.94433023898546"
        fill="none"
        stroke="#fff"
        stroke-width="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        display={isCompleted('WREBxWSNQDD_6fzpHL6CE') ? 'block' : 'none'}
      ></path>
      <circle
        cx="-505.52532545570534"
        cy="347.94433023898546"
        r="9.5"
        fill="#16a34a"
        id="icon-link"
        display={isCompleted('RFuy3Eho3mnW1GpP08BVw') ? 'block' : 'none'}
      ></circle>
      <path
        d="M-509.52532545570534 347.94433023898546L-507.02532545570534 350.94433023898546 -502.02532545570534 345.94433023898546"
        fill="none"
        stroke="#fff"
        stroke-width="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        display={isCompleted('RFuy3Eho3mnW1GpP08BVw') ? 'block' : 'none'}
      ></path>
      <circle
        cx="-505.52532545570534"
        cy="400.94433023898546"
        r="9.5"
        fill="#16a34a"
        id="icon-link"
        display={isCompleted('aE6XBgH23135_9QmD4ff2') ? 'block' : 'none'}
      ></circle>
      <path
        d="M-509.52532545570534 400.94433023898546L-507.02532545570534 403.94433023898546 -502.02532545570534 398.94433023898546"
        fill="none"
        stroke="#fff"
        stroke-width="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        display={isCompleted('aE6XBgH23135_9QmD4ff2') ? 'block' : 'none'}
      ></path>
      <circle
        cx="-505.52532545570534"
        cy="453.94433023898546"
        r="9.5"
        fill="#16a34a"
        id="icon-link"
        display={isCompleted('4T59gdcwdXqj9kCuK7cfp') ? 'block' : 'none'}
      ></circle>
      <path
        d="M-509.52532545570534 453.94433023898546L-507.02532545570534 456.94433023898546 -502.02532545570534 451.94433023898546"
        fill="none"
        stroke="#fff"
        stroke-width="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        display={isCompleted('4T59gdcwdXqj9kCuK7cfp') ? 'block' : 'none'}
      ></path>
      <circle
        cx="538.4746745442947"
        cy="302.44433023898546"
        r="9.5"
        fill="#16a34a"
        id="icon-link"
        display={isCompleted('8OBlgDRUg-CTgDXY-QHyO') ? 'block' : 'none'}
      ></circle>
      <path
        d="M534.4746745442947 302.44433023898546L536.9746745442947 305.44433023898546 541.9746745442947 300.44433023898546"
        fill="none"
        stroke="#fff"
        stroke-width="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        display={isCompleted('8OBlgDRUg-CTgDXY-QHyO') ? 'block' : 'none'}
      ></path>
      <circle
        cx="538.4746745442947"
        cy="355.44433023898546"
        r="9.5"
        fill="#16a34a"
        id="icon-link"
        display={isCompleted('HeWVCPHqVnnbOn6zIim4K') ? 'block' : 'none'}
      ></circle>
      <path
        d="M534.4746745442947 355.44433023898546L536.9746745442947 358.44433023898546 541.9746745442947 353.44433023898546"
        fill="none"
        stroke="#fff"
        stroke-width="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        display={isCompleted('HeWVCPHqVnnbOn6zIim4K') ? 'block' : 'none'}
      ></path>
      <circle
        cx="538.4746745442947"
        cy="408.44433023898546"
        r="9.5"
        fill="#16a34a"
        id="icon-link"
        display={isCompleted('vdumdIglnouf1KyGIGZnc') ? 'block' : 'none'}
      ></circle>
      <path
        d="M534.4746745442947 408.44433023898546L536.9746745442947 411.44433023898546 541.9746745442947 406.44433023898546"
        fill="none"
        stroke="#fff"
        stroke-width="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        display={isCompleted('vdumdIglnouf1KyGIGZnc') ? 'block' : 'none'}
      ></path>
      <circle
        cx="538.4746745442947"
        cy="461.44433023898546"
        r="9.5"
        fill="#16a34a"
        id="icon-link"
        display={isCompleted('_zNAOhFWMcWqP4oxNPCXF') ? 'block' : 'none'}
      ></circle>
      <path
        d="M534.4746745442947 461.44433023898546L536.9746745442947 464.44433023898546 541.9746745442947 459.44433023898546"
        fill="none"
        stroke="#fff"
        stroke-width="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        display={isCompleted('_zNAOhFWMcWqP4oxNPCXF') ? 'block' : 'none'}
      ></path>
      <circle
        cx="538.4746745442947"
        cy="514.4443302389855"
        r="9.5"
        fill="#16a34a"
        id="icon-link"
        display={isCompleted('Nex2HcTOYIbfqUzXyxSMY') ? 'block' : 'none'}
      ></circle>
      <path
        d="M534.4746745442947 514.4443302389855L536.9746745442947 517.4443302389855 541.9746745442947 512.4443302389855"
        fill="none"
        stroke="#fff"
        stroke-width="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        display={isCompleted('Nex2HcTOYIbfqUzXyxSMY') ? 'block' : 'none'}
      ></path>
      <circle
        cx="538.4746745442947"
        cy="567.4443302389855"
        r="9.5"
        fill="#16a34a"
        id="icon-link"
        display={isCompleted('zOENl96GUZRw2PP2KxIck') ? 'block' : 'none'}
      ></circle>
      <path
        d="M534.4746745442947 567.4443302389855L536.9746745442947 570.4443302389855 541.9746745442947 565.4443302389855"
        fill="none"
        stroke="#fff"
        stroke-width="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        display={isCompleted('zOENl96GUZRw2PP2KxIck') ? 'block' : 'none'}
      ></path>
      <circle
        cx="143.97467454429466"
        cy="359.44433023898546"
        r="9.5"
        fill="#16a34a"
        id="icon-link"
        display={isCompleted('8OnzX03hkZ9K9i__tjmFX') ? 'block' : 'none'}
      ></circle>
      <path
        d="M139.97467454429466 359.44433023898546L142.47467454429466 362.44433023898546 147.47467454429466 357.44433023898546"
        fill="none"
        stroke="#fff"
        stroke-width="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        display={isCompleted('8OnzX03hkZ9K9i__tjmFX') ? 'block' : 'none'}
      ></path>
      <circle
        cx="-249.45515386471317"
        cy="545.0892656435051"
        r="9.5"
        fill="#16a34a"
        id="icon-link"
        display={isCompleted('HX75SExuzR5AP7TQ94qid') ? 'block' : 'none'}
      ></circle>
      <path
        d="M-253.45515386471317 545.0892656435051L-250.95515386471317 548.0892656435051 -245.95515386471317 543.0892656435051"
        fill="none"
        stroke="#fff"
        stroke-width="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        display={isCompleted('HX75SExuzR5AP7TQ94qid') ? 'block' : 'none'}
      ></path>
      <circle
        cx="-241.02532545570534"
        cy="306.94433023898546"
        r="9.5"
        fill="#16a34a"
        id="icon-link"
        display={isCompleted('dgoDNDtW2_q9R9yhkXrcz') ? 'block' : 'none'}
      ></circle>
      <path
        d="M-245.02532545570534 306.94433023898546L-242.52532545570534 309.94433023898546 -237.52532545570534 304.94433023898546"
        fill="none"
        stroke="#fff"
        stroke-width="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        display={isCompleted('dgoDNDtW2_q9R9yhkXrcz') ? 'block' : 'none'}
      ></path>
      <circle
        cx="-10.525325455705342"
        cy="306.94433023898546"
        r="9.5"
        fill="#16a34a"
        id="icon-link"
        display={isCompleted('t_laNdMmdLApYszqXRdWg') ? 'block' : 'none'}
      ></circle>
      <path
        d="M-14.525325455705342 306.94433023898546L-12.025325455705342 309.94433023898546 -7.025325455705342 304.94433023898546"
        fill="none"
        stroke="#fff"
        stroke-width="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        display={isCompleted('t_laNdMmdLApYszqXRdWg') ? 'block' : 'none'}
      ></path>
      <circle
        cx="-10.525325455705342"
        cy="358.94433023898546"
        r="9.5"
        fill="#16a34a"
        id="icon-link"
        display={isCompleted('w3bNp7OkehI1gjx8NzlC8') ? 'block' : 'none'}
      ></circle>
      <path
        d="M-14.525325455705342 358.94433023898546L-12.025325455705342 361.94433023898546 -7.025325455705342 356.94433023898546"
        fill="none"
        stroke="#fff"
        stroke-width="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        display={isCompleted('w3bNp7OkehI1gjx8NzlC8') ? 'block' : 'none'}
      ></path>
      <circle
        cx="-241.02532545570534"
        cy="358.94433023898546"
        r="9.5"
        fill="#16a34a"
        id="icon-link"
        display={isCompleted('v48Mv0wQqjXbvy8x6gDjQ') ? 'block' : 'none'}
      ></circle>
      <path
        d="M-245.02532545570534 358.94433023898546L-242.52532545570534 361.94433023898546 -237.52532545570534 356.94433023898546"
        fill="none"
        stroke="#fff"
        stroke-width="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        display={isCompleted('v48Mv0wQqjXbvy8x6gDjQ') ? 'block' : 'none'}
      ></path>
      <circle
        cx="-240.02532545570534"
        cy="410.94433023898546"
        r="9.5"
        fill="#16a34a"
        id="icon-link"
        display={isCompleted('D5_O-uElftYGQr_bTU_se') ? 'block' : 'none'}
      ></circle>
      <path
        d="M-244.02532545570534 410.94433023898546L-241.52532545570534 413.94433023898546 -236.52532545570534 408.94433023898546"
        fill="none"
        stroke="#fff"
        stroke-width="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        display={isCompleted('D5_O-uElftYGQr_bTU_se') ? 'block' : 'none'}
      ></path>
      <circle
        cx="143.97467454429466"
        cy="306.44433023898546"
        r="9.5"
        fill="#16a34a"
        id="icon-link"
        display={isCompleted('YEpkbNzEMzS6wAKg85J_N') ? 'block' : 'none'}
      ></circle>
      <path
        d="M139.97467454429466 306.44433023898546L142.47467454429466 309.44433023898546 147.47467454429466 304.44433023898546"
        fill="none"
        stroke="#fff"
        stroke-width="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        display={isCompleted('YEpkbNzEMzS6wAKg85J_N') ? 'block' : 'none'}
      ></path>
      <circle
        cx="-249.45515386471317"
        cy="598.0892656435051"
        r="9.5"
        fill="#16a34a"
        id="icon-link"
        display={isCompleted('mkyU0ug8MXxV4biHuOity') ? 'block' : 'none'}
      ></circle>
      <path
        d="M-253.45515386471317 598.0892656435051L-250.95515386471317 601.0892656435051 -245.95515386471317 596.0892656435051"
        fill="none"
        stroke="#fff"
        stroke-width="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        display={isCompleted('mkyU0ug8MXxV4biHuOity') ? 'block' : 'none'}
      ></path>
      <circle
        cx="538.9746745442947"
        cy="849.7974386815656"
        r="9.5"
        fill="#19a323"
        id="icon-link"
        display={isCompleted('zWL8VLx_g0SWubavJDs6i') ? 'block' : 'none'}
      ></circle>
      <path
        d="M534.9746745442947 849.7974386815656L537.4746745442947 852.7974386815656 542.4746745442947 847.7974386815656"
        fill="none"
        stroke="#fff"
        stroke-width="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        display={isCompleted('zWL8VLx_g0SWubavJDs6i') ? 'block' : 'none'}
      ></path>
      <circle
        cx="538.9746745442947"
        cy="796.7974386815656"
        r="9.5"
        fill="#16a34a"
        id="icon-link"
        display={isCompleted('jvp43wFkKlGQX2y7IxkbM') ? 'block' : 'none'}
      ></circle>
      <path
        d="M534.9746745442947 796.7974386815656L537.4746745442947 799.7974386815656 542.4746745442947 794.7974386815656"
        fill="none"
        stroke="#fff"
        stroke-width="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        display={isCompleted('jvp43wFkKlGQX2y7IxkbM') ? 'block' : 'none'}
      ></path>
      <circle
        cx="83.193201050423"
        cy="762.9443302389855"
        r="9.5"
        fill="#16a34a"
        id="icon-link"
        display={isCompleted('10uL0r388lKh8pWYWqRZD') ? 'block' : 'none'}
      ></circle>
      <path
        d="M79.193201050423 762.9443302389855L81.693201050423 765.9443302389855 86.693201050423 760.9443302389855"
        fill="none"
        stroke="#fff"
        stroke-width="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        display={isCompleted('10uL0r388lKh8pWYWqRZD') ? 'block' : 'none'}
      ></path>
      <circle
        cx="83.193201050423"
        cy="815.9443302389855"
        r="9.5"
        fill="#16a34a"
        id="icon-link"
        display={isCompleted('yI6XiNW04EL78UL4lkVgd') ? 'block' : 'none'}
      ></circle>
      <path
        d="M79.193201050423 815.9443302389855L81.693201050423 818.9443302389855 86.693201050423 813.9443302389855"
        fill="none"
        stroke="#fff"
        stroke-width="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        display={isCompleted('yI6XiNW04EL78UL4lkVgd') ? 'block' : 'none'}
      ></path>
      <circle
        cx="-199.52532545570534"
        cy="813.9443302389855"
        r="9.5"
        fill="#16a34a"
        id="icon-link"
        display={isCompleted('KO3viVIJJREtxXxsocN7j') ? 'block' : 'none'}
      ></circle>
      <path
        d="M-203.52532545570534 813.9443302389855L-201.02532545570534 816.9443302389855 -196.02532545570534 811.9443302389855"
        fill="none"
        stroke="#fff"
        stroke-width="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        display={isCompleted('KO3viVIJJREtxXxsocN7j') ? 'block' : 'none'}
      ></path>
      <circle
        cx="-453.02532545570534"
        cy="748.9443302389855"
        r="9.5"
        fill="#19a323"
        id="icon-link"
        display={isCompleted('uqphqAnlcJOLnwHZs5jWu') ? 'block' : 'none'}
      ></circle>
      <path
        d="M-457.02532545570534 748.9443302389855L-454.52532545570534 751.9443302389855 -449.52532545570534 746.9443302389855"
        fill="none"
        stroke="#fff"
        stroke-width="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        display={isCompleted('uqphqAnlcJOLnwHZs5jWu') ? 'block' : 'none'}
      ></path>
      <circle
        cx="-453.02532545570534"
        cy="695.9443302389855"
        r="9.5"
        fill="#19a323"
        id="icon-link"
        display={isCompleted('gy7eBxPOlwG8BvxHVLDQ9') ? 'block' : 'none'}
      ></circle>
      <path
        d="M-457.02532545570534 695.9443302389855L-454.52532545570534 698.9443302389855 -449.52532545570534 693.9443302389855"
        fill="none"
        stroke="#fff"
        stroke-width="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        display={isCompleted('gy7eBxPOlwG8BvxHVLDQ9') ? 'block' : 'none'}
      ></path>
      <circle
        cx="-453.02532545570534"
        cy="801.9443302389855"
        r="9.5"
        fill="#16a34a"
        id="icon-link"
        display={isCompleted('njKsYNkwTXPQ1NjlGKXab') ? 'block' : 'none'}
      ></circle>
      <path
        d="M-457.02532545570534 801.9443302389855L-454.52532545570534 804.9443302389855 -449.52532545570534 799.9443302389855"
        fill="none"
        stroke="#fff"
        stroke-width="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        display={isCompleted('njKsYNkwTXPQ1NjlGKXab') ? 'block' : 'none'}
      ></path>
      <circle
        cx="-199.52532545570534"
        cy="760.9443302389855"
        r="9.5"
        fill="#19a323"
        id="icon-link"
        display={isCompleted('awoEhwPKjUcR84XGL6Som') ? 'block' : 'none'}
      ></circle>
      <path
        d="M-203.52532545570534 760.9443302389855L-201.02532545570534 763.9443302389855 -196.02532545570534 758.9443302389855"
        fill="none"
        stroke="#fff"
        stroke-width="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        display={isCompleted('awoEhwPKjUcR84XGL6Som') ? 'block' : 'none'}
      ></path>
      <circle
        cx="20.474674544294658"
        cy="960.4443302389855"
        r="9.5"
        fill="#16a34a"
        id="icon-link"
        display={isCompleted('XL9XOV2h0BAuA5cFcM5L_') ? 'block' : 'none'}
      ></circle>
      <path
        d="M16.474674544294658 960.4443302389855L18.974674544294658 963.4443302389855 23.974674544294658 958.4443302389855"
        fill="none"
        stroke="#fff"
        stroke-width="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        display={isCompleted('XL9XOV2h0BAuA5cFcM5L_') ? 'block' : 'none'}
      ></path>
      <circle
        cx="20.474674544294658"
        cy="1013.4443302389855"
        r="9.5"
        fill="#19a323"
        id="icon-link"
        display={isCompleted('RvDfKoa_HIW3QDBfkPv3m') ? 'block' : 'none'}
      ></circle>
      <path
        d="M16.474674544294658 1013.4443302389855L18.974674544294658 1016.4443302389855 23.974674544294658 1011.4443302389855"
        fill="none"
        stroke="#fff"
        stroke-width="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        display={isCompleted('RvDfKoa_HIW3QDBfkPv3m') ? 'block' : 'none'}
      ></path>
      <circle
        cx="20.474674544294658"
        cy="1066.4443302389855"
        r="9.5"
        fill="#19a323"
        id="icon-link"
        display={isCompleted('kiCTo0U6VgNON8rv_Ktlj') ? 'block' : 'none'}
      ></circle>
      <path
        d="M16.474674544294658 1066.4443302389855L18.974674544294658 1069.4443302389855 23.974674544294658 1064.4443302389855"
        fill="none"
        stroke="#fff"
        stroke-width="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        display={isCompleted('kiCTo0U6VgNON8rv_Ktlj') ? 'block' : 'none'}
      ></path>
      <circle
        cx="-45.39686072916362"
        cy="1305.976431006493"
        r="9.5"
        fill="#19a323"
        id="icon-link"
        display={isCompleted('ElqWQClryfSYdL7P_mgYK') ? 'block' : 'none'}
      ></circle>
      <path
        d="M-49.39686072916362 1305.976431006493L-46.89686072916362 1308.976431006493 -41.89686072916362 1303.976431006493"
        fill="none"
        stroke="#fff"
        stroke-width="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        display={isCompleted('ElqWQClryfSYdL7P_mgYK') ? 'block' : 'none'}
      ></path>
      <circle
        cx="-45.39686072916362"
        cy="1252.476431006493"
        r="9.5"
        fill="#16a34a"
        id="icon-link"
        display={isCompleted('5EPmbiNdP_vhIXclv_GjV') ? 'block' : 'none'}
      ></circle>
      <path
        d="M-49.39686072916362 1252.476431006493L-46.89686072916362 1255.476431006493 -41.89686072916362 1250.476431006493"
        fill="none"
        stroke="#fff"
        stroke-width="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        display={isCompleted('5EPmbiNdP_vhIXclv_GjV') ? 'block' : 'none'}
      ></path>
      <circle
        cx="-46.39686072916362"
        cy="1358.976431006493"
        r="9.5"
        fill="#19a323"
        id="icon-link"
        display={isCompleted('h49-tjEkKcq7d7ikRHIOx') ? 'block' : 'none'}
      ></circle>
      <path
        d="M-49.39686072916362 1358.976431006493L-46.89686072916362 1361.976431006493 -41.89686072916362 1356.976431006493"
        fill="none"
        stroke="#fff"
        stroke-width="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        display={isCompleted('h49-tjEkKcq7d7ikRHIOx') ? 'block' : 'none'}
      ></path>
      <circle
        cx="135.47467454429466"
        cy="1010.4443302389855"
        r="9.5"
        fill="#16a34a"
        id="icon-link"
        display={isCompleted('opa61u9gYgSpoPtxp58wu') ? 'block' : 'none'}
      ></circle>
      <path
        d="M131.47467454429466 1010.4443302389855L133.97467454429466 1013.4443302389855 138.97467454429466 1008.4443302389855"
        fill="none"
        stroke="#fff"
        stroke-width="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        display={isCompleted('opa61u9gYgSpoPtxp58wu') ? 'block' : 'none'}
      ></path>
      <circle
        cx="135.47467454429466"
        cy="1063.4443302389855"
        r="9.5"
        fill="#16a34a"
        id="icon-link"
        display={isCompleted('cQllxv7qGbRtM9O5llgN6') ? 'block' : 'none'}
      ></circle>
      <path
        d="M131.47467454429466 1063.4443302389855L133.97467454429466 1066.4443302389855 138.97467454429466 1061.4443302389855"
        fill="none"
        stroke="#fff"
        stroke-width="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        display={isCompleted('cQllxv7qGbRtM9O5llgN6') ? 'block' : 'none'}
      ></path>
      <circle
        cx="310.47467454429466"
        cy="1238.4443302389855"
        r="9.5"
        fill="#19a323"
        id="icon-link"
        display={isCompleted('zN7Ps1puD-YpHbKi1pHH8') ? 'block' : 'none'}
      ></circle>
      <path
        d="M306.47467454429466 1238.4443302389855L308.97467454429466 1241.4443302389855 313.97467454429466 1236.4443302389855"
        fill="none"
        stroke="#fff"
        stroke-width="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        display={isCompleted('zN7Ps1puD-YpHbKi1pHH8') ? 'block' : 'none'}
      ></path>
      <circle
        cx="533.4946952381852"
        cy="1060.4443302389855"
        r="9.5"
        fill="#16a34a"
        id="icon-link"
        display={isCompleted('HdWq9ue0JdwmwqSIN2OD_') ? 'block' : 'none'}
      ></circle>
      <path
        d="M529.4946952381852 1060.4443302389855L531.9946952381852 1063.4443302389855 536.9946952381852 1058.4443302389855"
        fill="none"
        stroke="#fff"
        stroke-width="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        display={isCompleted('HdWq9ue0JdwmwqSIN2OD_') ? 'block' : 'none'}
      ></path>
      <circle
        cx="554.4946952381852"
        cy="1498.1701814857588"
        r="9.5"
        fill="#16a34a"
        id="icon-link"
        display={isCompleted('_5ht0PAdVOJWPzTRS1mVg') ? 'block' : 'none'}
      ></circle>
      <path
        d="M550.4946952381852 1498.1701814857588L552.9946952381852 1501.1701814857588 557.9946952381852 1496.1701814857588"
        fill="none"
        stroke="#fff"
        stroke-width="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        display={isCompleted('_5ht0PAdVOJWPzTRS1mVg') ? 'block' : 'none'}
      ></path>
      <circle
        cx="249.193201050423"
        cy="1401.4581550365865"
        r="9.5"
        fill="#16a34a"
        id="icon-link"
        display={isCompleted('ElgRwv5LSVg5FXGx-2K2s') ? 'block' : 'none'}
      ></circle>
      <path
        d="M245.193201050423 1401.4581550365865L247.693201050423 1404.4581550365865 252.693201050423 1399.4581550365865"
        fill="none"
        stroke="#fff"
        stroke-width="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        display={isCompleted('ElgRwv5LSVg5FXGx-2K2s') ? 'block' : 'none'}
      ></path>
      <circle
        cx="249.193201050423"
        cy="1453.4581550365865"
        r="9.5"
        fill="#16a34a"
        id="icon-link"
        display={isCompleted('K3RZ8ESxWCpLKHePF87Hy') ? 'block' : 'none'}
      ></circle>
      <path
        d="M245.193201050423 1453.4581550365865L247.693201050423 1456.4581550365865 252.693201050423 1451.4581550365865"
        fill="none"
        stroke="#fff"
        stroke-width="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        display={isCompleted('K3RZ8ESxWCpLKHePF87Hy') ? 'block' : 'none'}
      ></path>
      <circle
        cx="-348.08952699071995"
        cy="1735.5475484484205"
        r="9.5"
        fill="#16a34a"
        id="icon-link"
        display={isCompleted('H6-XGDjs4f-qbv13v5av0') ? 'block' : 'none'}
      ></circle>
      <path
        d="M-352.08952699071995 1735.5475484484205L-349.58952699071995 1738.5475484484205 -344.58952699071995 1733.5475484484205"
        fill="none"
        stroke="#fff"
        stroke-width="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        display={isCompleted('H6-XGDjs4f-qbv13v5av0') ? 'block' : 'none'}
      ></path>
    </svg>
  )
}
