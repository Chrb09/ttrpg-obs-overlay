import React from "react";

// 1. Definimos os tipos para as props do nosso componente.
//    Usamos React.SVGProps<SVGSVGElement> para herdar todas as props de um SVG.
type MythicColorProps = React.SVGProps<SVGSVGElement> & {
  color?: string;
  // A 'className' é opcional, então não é mais obrigatória.
  // Note que ela já está incluída em React.SVGProps, então não precisaríamos redeclará-la,
  // mas deixo aqui para fins de clareza.
};

const MythicColor = ({
  color = "#F7D1AB",
  ...rest // 'rest' agora contém width, height, className, onClick, etc.
}: MythicColorProps) => {
  // 2. Aplicamos os tipos aqui.
  return (
    <svg
      version="1.0"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 300.000000 400.000000"
      preserveAspectRatio="xMidYMid meet"
      {...rest} // Passamos todas as props de SVG, incluindo className
    >
      <g transform="translate(0.000000,400.000000) scale(0.100000,-0.100000)" fill={color} stroke="none">
        {" "}
        <path d="M1455 3673 c-105 -119 -320 -243 -503 -288 -97 -24 -114 -25 -405 -25 l-304 0 -22 -24 c-14 -15 -19 -26 -12 -31 14 -8 14 -135 0 -194 -5 -24 -7 -46 -4 -49 6 -6 39 10 84 43 44 32 61 20 61 -44 0 -25 5 -118 12 -207 14 -187 4 -285 -38 -391 -30 -75 -32 -108 -9 -173 9 -25 29 -95 46 -156 45 -173 39 -268 -28 -429 -23 -53 -25 -69 -21 -160 4 -82 10 -110 32 -156 42 -89 50 -154 31 -257 -9 -48 -20 -102 -26 -119 -6 -18 -17 -74 -24 -125 -8 -51 -19 -113 -25 -138 -19 -85 -23 -299 -7 -385 19 -105 72 -230 118 -279 l36 -39 7 38 c25 132 148 256 376 378 152 82 345 149 623 218 47 12 79 6 294 -55 181 -50 296 -95 423 -163 228 -122 339 -232 374 -372 l12 -43 35 39 c45 50 96 171 116 277 17 87 13 296 -7 386 -6 25 -17 88 -25 140 -7 53 -18 107 -23 121 -6 13 -17 67 -26 120 -19 110 -12 169 31 258 21 46 27 75 31 156 4 91 2 107 -21 160 -79 189 -78 274 9 552 32 104 33 125 0 205 -41 104 -50 196 -37 398 6 96 12 192 13 213 3 60 21 65 75 23 54 -42 79 -47 68 -13 -14 45 -18 214 -6 222 9 5 6 14 -10 31 l-22 24 -304 0 c-291 0 -308 1 -405 25 -182 45 -392 165 -506 289 -23 25 -43 46 -45 45 -1 0 -20 -21 -42 -46z m-13 -930 l58 -57 53 52 c29 29 59 52 67 52 8 0 136 -51 284 -113 l270 -112 58 -84 58 -84 0 -445 0 -444 -47 6 c-131 17 -643 51 -753 50 -106 0 -552 -31 -727 -50 l-53 -5 0 440 0 441 56 88 c56 86 58 88 128 117 39 16 163 68 276 117 113 48 207 87 210 88 2 0 30 -26 62 -57z" />{" "}
      </g>
    </svg>
  );
};

export default MythicColor;
