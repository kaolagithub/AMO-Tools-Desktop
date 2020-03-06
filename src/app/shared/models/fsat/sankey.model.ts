export interface FsatSankeyNode {
    name: string,
    value: number,
    x: number,
    y: number,
    nodeColor: string,
    source: number,
    target: number[],
    isConnector: boolean,
    id?: string,
}


export interface SankeyNode {
    name: string,
    value: number,
    x: number,
    y: number,
    nodeColor: string,
    source: number,
    targets: number[],
    isConnector: boolean,
    id?: string
}

export interface SankeyData {
    energyInput: number,
    losses: Array<{ label: string, value: number }>,
    additions: Array<{ label: string, value: number }>
    outputEnergy: number
}

export interface SankeyColors {
    gradientStartColor: string;
    gradientEndColor: string;
    nodeStartColor: string;
    nodeArrowColor: string;
}