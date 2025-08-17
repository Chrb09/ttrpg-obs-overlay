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
        <path d="M1454 3937 c-82 -106 -250 -210 -434 -271 -119 -39 -187 -46 -490 -46 -255 -1 -287 -3 -305 -18 -18 -15 -20 -30 -21 -160 -1 -79 2 -142 7 -140 4 2 18 18 31 37 13 19 29 37 37 39 16 5 13 -165 -10 -693 -6 -144 -9 -418 -6 -615 5 -356 10 -416 52 -619 12 -59 17 -184 23 -571 l7 -494 224 -178 c205 -161 226 -176 246 -165 12 7 126 80 253 162 210 136 232 153 232 178 0 15 6 27 13 27 22 0 115 -59 152 -96 l36 -36 48 45 c47 44 84 68 129 81 19 6 22 4 22 -21 0 -26 21 -41 245 -185 134 -87 250 -159 255 -160 6 -2 112 76 234 172 l223 175 6 284 c4 156 7 379 7 496 0 174 3 227 20 303 43 198 54 336 53 707 -1 193 -6 454 -12 580 -22 448 -25 625 -12 625 6 0 24 -18 39 -40 28 -40 50 -47 44 -14 -2 10 -5 74 -7 142 -3 106 -6 125 -22 137 -14 12 -75 14 -303 15 -157 0 -313 5 -346 10 -209 34 -472 172 -574 302 -23 29 -45 54 -49 55 -3 1 -24 -22 -47 -50z m-12 -934 l58 -57 59 58 59 59 277 -115 276 -115 57 -84 57 -84 3 -452 4 -453 -29 0 c-16 0 -181 14 -366 30 -186 17 -365 30 -400 30 -34 0 -213 -13 -397 -30 -184 -16 -348 -30 -364 -30 l-29 0 7 453 7 452 57 84 57 85 270 113 c149 62 272 113 275 113 2 0 30 -26 62 -57z" />{" "}
      </g>
    </svg>
  );
};

export default MythicColor;
