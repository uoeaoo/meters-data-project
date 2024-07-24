export interface Address {
    id: string;
    number: number;
    str_number: string;
    str_number_full: string;
    house: {
        address: string;
        id: string;
        fias_addrobjs: any[];
    };
}