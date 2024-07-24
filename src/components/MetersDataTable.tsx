import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react-lite';
import { toJS } from "mobx";
import metersDataStore from "./store/MetersDataStore";
import './MetersDataTable.css'

const MetersDataTable: React.FC = observer(() => { 
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        metersDataStore.fetchMetersData(); 
    }, []);

   const totalPages = Math.ceil(metersDataStore.totalCount / metersDataStore.limit);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        metersDataStore.offset = (page - 1) * metersDataStore.limit;
        metersDataStore.fetchMetersData();
    };

    const getAddress = (addressId: string) => {
        const address = toJS(metersDataStore.addresses.get(addressId));
        console.log(`Getting address for ${addressId}:`, address);
        if (address) {
            const { house } = address;
            if (house && house.address) {
                return `${house.address}, кв. ${address.str_number}`;
            }
        }
        return 'Loading...';
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear()).slice(-2);
        return `${day}.${month}.${year}`;
    };

    const getTypeRepresentation = (types: string[]) => {
        if (types.includes("ColdWaterAreaMeter")) {
            return <div><img src="assets/cold-water-icon.svg" alt="Cold Water" /> ХВС</div>;
        } else if (types.includes("HotWaterAreaMeter")) {
            return <div><img src="assets/hot-water-icon.svg" alt="Hot Water" /> ГВС</div>;
        }
        return types.join(', ');
    };

    const renderPaginationButtons = () => {
        let pages = [];
        if (totalPages <= 1) return null;

        pages.push(
            <button key={1} onClick={() => handlePageChange(1)} disabled={currentPage === 1}>
                1
            </button>
        );

        if (currentPage > 3) {
            pages.push(
                <button key="start-ellipsis" onClick={() => handlePageChange(currentPage - 3)}>
                    ...
                </button>
            );
        }

        const startPage = Math.max(currentPage - 1, 2);
        const endPage = Math.min(currentPage + 1, totalPages - 1);

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button key={i} onClick={() => handlePageChange(i)} disabled={currentPage === i}>
                    {i}
                </button>
            );
        }

        if (currentPage < totalPages - 2) {
            pages.push(
                <button key="end-ellipsis" onClick={() => handlePageChange(currentPage + 3)}>
                    ...
                </button>
            );
        }

        if (totalPages > 1) {
            pages.push(
                <button key={totalPages} onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages}>
                    {totalPages}
                </button>
            );
        }

        return pages;
    };

    const handleDelete = async (meterId: string) => {
        try {
            const response = await fetch(`http://showroom.eis24.me/api/v4/test/meters/${meterId}/`, {
                method: 'DELETE'
            });
            if (response.ok) {
                
                metersDataStore.fetchMetersData();
            } else {
                console.error('Failed to delete meter:', response.statusText);
            }
        } catch (error) {
            console.error('Error deleting meter:', error);
        }
    };


    console.log('Current meters:', metersDataStore.metersData);
    console.log('Current addresses:', metersDataStore.addresses);

    return (
        <div className="table-container">
            <table className="table">
                <thead>
                    <tr className="tr-head">
                        <th className="th-head-number">№</th>
                        <th className="th-head-type">Тип</th>
                        <th className="th-head-date">Дата установки</th>
                        <th className="th-head-automatic">Автоматический</th>
                        <th className="th-head-meters">Текущие показания</th>
                        <th className="th-head-address">Адрес</th>
                        <th className="th-head-notes">Примечания</th>
                        <th className="th-head-action"></th>
                    </tr>
                </thead>
                <tbody>
                    {metersDataStore.metersData.map((meter, index) => (
                        <tr className="tr-body" key={meter.id}>
                            <td className="td-head-number">{index + 1 + metersDataStore.offset}</td>
                            <td>{getTypeRepresentation(meter._type)}</td>
                            <td>{formatDate(meter.installation_date)}</td>
                            <td>{meter.is_automatic ? 'Да' : 'Нет'}</td>
                            <td>{meter.initial_values.join(', ')}</td>
                            <td>{getAddress(meter.area.id)}</td>
                            <td>{meter.description || '-'}</td>
                            <td>
                                <button className="delete-button" onClick={() => handleDelete(meter.id)}>
                                    <img src="assets/trash-icon.svg" alt="Delete" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="button-container">
                {renderPaginationButtons()}
            </div>
        </div>
    );
});

export default MetersDataTable;