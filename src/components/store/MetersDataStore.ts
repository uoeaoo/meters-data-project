import { makeAutoObservable, observable } from "mobx";
import { MetersData } from "../types/MetersData";
import { Address } from "../types/Address";

class MetersDataStore {
    metersData: MetersData[] = [];
    addresses: Map<string, Address> = observable.map();
    limit = 20; 
    offset = 0; 
    totalCount = 0;

    constructor() {
        makeAutoObservable(this);
    }

    setMetersData(data: MetersData[], totalCount: number) {
        this.metersData = data; 
        this.totalCount = totalCount;
        const addressIds = Array.from(new Set(data.map((meter) => meter.area.id))); // Удаляем дубликаты
        this.fetchAddresses(addressIds);
    }

    setAddress(address: Address) {
        if (!address.id) {
            console.error('Address does not have an id:', address);
            return;
        }
        console.log('Setting address:', address);
        this.addresses.set(address.id, address);
        console.log('Addresses after setAddress:', this.addresses);
    }

    async fetchMetersData() {
        try { 
            const response = await fetch(`http://showroom.eis24.me/api/v4/test/meters/?limit=${this.limit}&offset=${this.offset}`, {
                method: 'GET'
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch meters data: ${response.statusText}`);
            }
            const data = await response.json();
            console.log('Fetched meters data:', data);
            const meters: MetersData[] = data.results;
            this.setMetersData(meters, data.count);
        } catch (error) {
            console.error('Failed to fetch meters data:', error);
        }
    }

    async fetchAddresses(ids: string[]) {
        try {
            const uniqueIds = Array.from(new Set(ids)); // Удаляем дубликаты
            console.log('Fetching addresses for IDs:', uniqueIds);

            for (const id of uniqueIds) {
                console.log(`Fetching address for ID: ${id}`);
                const response = await fetch(`http://showroom.eis24.me/api/v4/test/areas/?id__in=${id}`, {
                    method: 'GET'
                });
                if (!response.ok) {
                    throw new Error(`Failed to fetch address for ID ${id}: ${response.statusText}`);
                }
                const data = await response.json();
                console.log(`Fetched address for ID ${id}:`, data);
                if (data.results && Array.isArray(data.results)) {
                    data.results.forEach((address: Address) => this.setAddress(address));
                } else {
                    console.error('Unexpected response format:', data);
                }
            }
        } catch (error) {
            console.error('Failed to fetch addresses:', error);
        }
    }

    nextPage() {
        if (this.offset + this.limit < this.totalCount) {
            this.offset += this.limit;
            this.fetchMetersData();
        }
    }

    prevPage() {
        if (this.offset > 0) {
            this.offset -= this.limit; 
            this.fetchMetersData();
        }
    }
}

const metersDataStore = new MetersDataStore();
export default metersDataStore;