<script setup>
import { onMounted, ref, watch } from 'vue';
import axios from 'axios';

onMounted(fetchData);

const counters = ref([]);
const widgetsData = ref(null);
const comparisonChartData = ref();
const comparisonChartOptions = ref();
const productionChartData = ref();
const productionChartOptions = ref();
const sortKey = ref(null);
const sortOrder = ref(null);
const sortField = ref(null);
const companyType = ref(false);
const groupCompanyData = ref(null);

const onSortChange = (event) => {
    const value = event.value.value;
    const sortValue = event.value;

    if (value.indexOf('!') === 0) {
        sortOrder.value = -1;
        sortField.value = value.substring(1, value.length);
        sortKey.value = sortValue;
    } else {
        sortOrder.value = 1;
        sortField.value = value;
        sortKey.value = sortValue;
    }

    fetchWidgetData(value, JSON.parse(localStorage.getItem('user')).token);
    fetchProductionChartData(value, JSON.parse(localStorage.getItem('user')).token);
    fetchcomparisonChartData(value, JSON.parse(localStorage.getItem('user')).token);
};

async function fetchData() {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.success || !user.token) {
            throw new Error('User not logged in or token missing');
        }

        if (user && user.company_type) {
            companyType.value = true;
            fetchGroupDashboardWidgetData(user.token);
        } else {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/v2/counters`, {
                headers: {
                    'Content-type': 'application/json',
                    Authorization: `Bearer ${user.token}`
                }
            });

            const data = await response.data;
            if (data.success) {
                counters.value = data.items.map((item) => {
                    return {
                        label: item.name,
                        value: item.id
                    };
                });
                counters.value.push({ label: 'test', value: 'test' });
                fetchWidgetData(data.items[0].id, user.token);
                fetchProductionChartData(data.items[0].id, user.token);
                fetchcomparisonChartData(data.items[0].id, user.token);
            } else {
                throw new Error('Request failed');
            }
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

async function fetchGroupDashboardWidgetData(token) {
    try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/v2/group-company-dashboard`, {
            headers: {
                'Content-type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.data;

        groupCompanyData.value = data;
        console.log(groupCompanyData.value);
    } catch (error) {
        console.log('Error fetching dashboard data:', error);
    }
}

async function fetchWidgetData(itemID, token) {
    try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/v2/dashboard/${itemID}`, {
            headers: {
                'Content-type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        });
        const data = await response.data;
        widgetsData.value = data;
        console.log(widgetsData.value);
    } catch (error) {
        console.log('Error fetching dashboard data:', error);
    }
}

async function fetchProductionChartData(itemID, token) {
    try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/v2/daily-generation/${itemID}`, {
            headers: {
                'Content-type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        });
        const data = await response.data;
        productionChartData.value = setProductionChartData(data);
        productionChartOptions.value = setcomparisonChartOptions();
    } catch (error) {
        console.error('Error fetching comparison chart data:', error);
        return null;
    }
}

async function fetchcomparisonChartData(itemID, token) {
    try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/v2/comparison-report/${itemID}`, {
            headers: {
                'Content-type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        });
        const data = await response.data;
        comparisonChartData.value = setComparisonChartData(data);
        comparisonChartOptions.value = setcomparisonChartOptions();
    } catch (error) {
        console.error('Error fetching comparison chart data:', error);
        return null;
    }
}

const setProductionChartData = (data) => {
    const documentStyle = getComputedStyle(document.documentElement);

    const transformedData = {
        labels: ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'],
        datasets: []
    };

    for (const key in data.data) {
        const yearlyData = data.data[key];

        const dataset = {
            label: key,
            fill: false,
            backgroundColor: 'rgba(23, 201, 232, 0.1)',
            borderColor: documentStyle.getPropertyValue('--cyan-500'),
            yAxisID: 'y',
            tension: 0.4,
            data: []
        };

        for (const monthIndex in yearlyData) {
            const monthData = yearlyData[monthIndex];

            dataset.data.push(monthData);
        }

        transformedData.datasets.push(dataset);
    }

    return transformedData;
};

const setComparisonChartData = (data) => {
    const documentStyle = getComputedStyle(document.documentElement);

    const transformedData = {
        labels: [],
        datasets: [
            {
                label: 'CN Sum',
                fill: false,
                backgroundColor: 'rgba(23, 201, 232, 0.1)',
                borderColor: documentStyle.getPropertyValue('--cyan-500'),
                yAxisID: 'y',
                tension: 0.4,
                data: []
            },
            {
                label: 'GN Sum',
                fill: false,
                backgroundColor: 'rgba(255, 99, 132, 0.1)',
                borderColor: documentStyle.getPropertyValue('--gray-500'),
                yAxisID: 'y1',
                tension: 0.4,
                data: []
            }
        ]
    };

    for (const year in data.data) {
        const yearlyData = data.data[year];

        for (const monthIndex in yearlyData) {
            const monthData = yearlyData[monthIndex];
            const cnSum = monthData.cn_sum;
            const gnSum = monthData.gn_sum;

            transformedData.labels.push(monthIndex);

            transformedData.datasets[0].data.push(cnSum);
            transformedData.datasets[1].data.push(gnSum);
        }
    }

    return transformedData;
};
const setcomparisonChartOptions = () => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    return {
        stacked: false,
        maintainAspectRatio: false,
        aspectRatio: 0.6,
        plugins: {
            legend: {
                labels: {
                    color: textColor
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder
                }
            },
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder
                }
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    drawOnChartArea: false,
                    color: surfaceBorder
                }
            }
        }
    };
};

let documentStyle = getComputedStyle(document.documentElement);
let textColor = documentStyle.getPropertyValue('--text-color');
const pieData = ref(null);
const pieOptions = ref(null);
const setChart = () => {
    pieData.value = {
        labels: ['A', 'B', 'C'],
        datasets: [
            {
                data: [540, 325, 702],
                backgroundColor: [documentStyle.getPropertyValue('--orange-300'), documentStyle.getPropertyValue('--purple-300'), documentStyle.getPropertyValue('--blue-300')],
                hoverBackgroundColor: [documentStyle.getPropertyValue('--indigo-400'), documentStyle.getPropertyValue('--purple-400'), documentStyle.getPropertyValue('--teal-400')]
            }
        ]
    };

    pieOptions.value = {
        plugins: {
            legend: {
                labels: {
                    usePointStyle: true,
                    color: textColor
                }
            }
        }
    };
};

watch(
    () => {
        setChart();
    },
    { immediate: true }
);
</script>

<template>
    <div v-if="companyType === true">
        <div class="pt-3 px-3 bg-white border-2 border-gray-100 mb-3" style="border-radius: 1rem">
            <div class="grid mb-3">
                <div class="col-12 lg:col-6 xl:col-3">
                    <div class="card h-full mb-0 relative relative" style="background-image: linear-gradient(to left, #aee3ff, #6cbdf7)">
                        <div class="text-900 text-white font-medium mb-3">Başlık:</div>
                        <div class="text-900 text-white font-medium mb-3">İsim: {{ groupCompanyData?.data[0].name }}</div>
                        <div class="text-900 text-white font-medium mb-3">Üretim Miktarı: {{ groupCompanyData?.data[0].production_sum }}</div>
                        <div class="text-900 text-white font-medium mb-3">Tüketim Miktarı: {{ groupCompanyData?.data[0].consumption_sum }}</div>
                        <div class="text-900 text-white font-medium mb-3">Mevcut Fatura: {{ groupCompanyData?.data[0].current_bill }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div v-else>
        <div class="pt-3 px-3 bg-white border-2 border-gray-100 mb-3" style="border-radius: 1rem">
            <Dropdown id="dropdown" v-model="sortKey" :options="counters" optionLabel="label" placeholder="Counters" @change="onSortChange($event)" class="mb-5" v-show="counters.length" />
            <div class="grid mb-3">
                <div class="col-12 lg:col-6 xl:col-3">
                    <div class="card h-full mb-0 relative relative" style="background-image: linear-gradient(to left, #aee3ff, #6cbdf7)">
                        <div class="flex justify-content-between mb-3">
                            <div>
                                <span class="block text-white text-500 font-medium mb-3">Üretim Miktarı</span>
                            </div>
                            <div class="flex align-items-center justify-content-center" style="width: 2.5rem; height: 2.5rem">
                                <i class="pi pi-shopping-cart text-blue-500" style="font-size: 2.5rem"></i>
                            </div>
                        </div>
                        <div class="text-900 text-white font-medium pl-5 pb-5 absolute bottom-0 left-0">Sayaç: {{ widgetsData?.data.production_sum }}</div>
                    </div>
                </div>
                <div class="col-12 lg:col-6 xl:col-3">
                    <div class="card h-full mb-0 relative" style="background-image: linear-gradient(to left, #fbd38d, #ffa500)">
                        <div class="flex justify-content-between mb-3">
                            <div>
                                <span class="block text-white text-500 font-medium mb-1">Maliyet Değişimi</span>
                                <span class="block text-white text-400 font-medium mb-3">(Bir Önceki Aya Göre)</span>
                            </div>
                            <div class="flex align-items-center justify-content-center" style="width: 2.5rem; height: 2.5rem">
                                <i class="pi pi-map-marker text-orange-500" style="font-size: 2.5rem"></i>
                            </div>
                        </div>
                        <div class="text-900 text-white font-medium pl-5 pb-5 absolute bottom-0 left-0">{{ widgetsData?.data.cost_change_from_last_month }}</div>
                    </div>
                </div>
                <div class="col-12 lg:col-6 xl:col-3">
                    <div class="card h-full mb-0 relative" style="background-image: linear-gradient(to left, #b2f5ea, #00b5cc)">
                        <div class="flex justify-content-between mb-3">
                            <div>
                                <span class="block text-white text-500 font-medium mb-3">Fatura Durumu</span>
                            </div>
                            <div class="flex align-items-center justify-content-center" style="width: 2.5rem; height: 2.5rem">
                                <i class="pi pi-inbox text-cyan-500" style="font-size: 2.5rem"></i>
                            </div>
                        </div>
                        <div class="text-900 text-white font-medium pl-5 pb-5 absolute bottom-0 left-0">{{ widgetsData?.data.estimated_bill }}</div>
                    </div>
                </div>
                <div class="col-12 lg:col-6 xl:col-3">
                    <div class="card h-full mb-0 relative" style="background-image: linear-gradient(to left, #d6bcfa, #8b5cf6)">
                        <div class="flex justify-content-between">
                            <div>
                                <span class="block text-white text-500 font-medium mb-3">Birim Maliyet</span>
                            </div>
                            <div class="flex align-items-center justify-content-center" style="width: 2.5rem; height: 2.5rem">
                                <i class="pi pi-comment text-purple-500" style="font-size: 2.5rem"></i>
                            </div>
                        </div>
                        <div class="flex flex-column gap-2">
                            <div>
                                <span class="text-900 font-medium text-white">{{ widgetsData?.data.unit_cost_without_vat }}</span> /
                                <span class="text-900 font-medium text-white">KDV Hariç Birim Maliyet</span>
                            </div>
                            <div>
                                <span class="text-900 font-medium text-white">{{ widgetsData?.data.unit_cost_with_vat }}</span> /
                                <span class="text-900 font-medium text-white">KDV Dahil Birim Maliyet</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-12 lg:col-6 xl:col-3">
                    <div class="card h-full mb-0 relative" style="background-image: linear-gradient(to left, #b2f5ea, #00b5cc)">
                        <div class="flex justify-content-between mb-3">
                            <div>
                                <span class="block text-white text-500 font-medium mb-1">Tahmini Fatura Durumu</span>
                                <span class="block text-400 text-white font-medium mb-3">(Bir Önceki Aya Göre)</span>
                            </div>
                            <div class="flex align-items-center justify-content-center" style="width: 2.5rem; height: 2.5rem">
                                <i class="pi pi-inbox text-cyan-500" style="font-size: 2.5rem"></i>
                            </div>
                        </div>
                        <div class="text-900 text-white font-medium pl-5 pb-5 absolute bottom-0 left-0">{{ widgetsData?.data.estimated_bill }}</div>
                    </div>
                </div>
                <div class="col-12 lg:col-6 xl:col-3">
                    <div class="card h-full mb-0 relative" style="background-image: linear-gradient(to left, #b2f5ea, #00b5cc)">
                        <div class="flex justify-content-between mb-3">
                            <div>
                                <span class="block text-white text-500 font-medium mb-3">Ges TL Bazlı Getirisi</span>
                            </div>
                            <div class="flex align-items-center justify-content-center" style="width: 2.5rem; height: 2.5rem">
                                <i class="pi pi-inbox text-cyan-500" style="font-size: 2.5rem"></i>
                            </div>
                        </div>
                        <div class="text-900 text-white font-medium pl-5 pb-5 absolute bottom-0 left-0">{{ widgetsData?.data.ges_tl_income }}</div>
                    </div>
                </div>
                <div class="col-12 lg:col-6 xl:col-3">
                    <div class="card h-full mb-0 relative" style="background-image: linear-gradient(to left, #b2f5ea, #00b5cc)">
                        <div class="flex justify-content-between mb-3">
                            <div>
                                <span class="block text-white text-500 font-medium mb-3">Ges Dolar Bazlı Getirisi</span>
                            </div>
                            <div class="flex align-items-center justify-content-center" style="width: 2.5rem; height: 2.5rem">
                                <i class="pi pi-inbox text-cyan-500" style="font-size: 2.5rem"></i>
                            </div>
                        </div>
                        <div class="text-900 text-white font-medium pl-5 pb-5 absolute bottom-0 left-0">{{ widgetsData?.data.ges_usd_income }}</div>
                    </div>
                </div>
                <div class="col-12 lg:col-6 xl:col-3">
                    <div class="card h-full mb-0 relative" style="background-image: linear-gradient(to left, #b2f5ea, #00b5cc)">
                        <div class="flex justify-content-between mb-3">
                            <div>
                                <span class="block text-white text-500 font-medium mb-3">İşletme Tüketiminin Ges'ten Karşılanma Oranı</span>
                            </div>
                            <div class="flex align-items-center justify-content-center" style="width: 2.5rem; height: 2.5rem">
                                <i class="pi pi-inbox text-cyan-500" style="font-size: 2.5rem"></i>
                            </div>
                        </div>
                        <div class="text-900 text-white font-medium pl-5 pb-5 absolute bottom-0 left-0">{{ widgetsData?.data.ges_coverage_rate }}</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="grid">
            <div class="col-12 xl:col-6">
                <div class="card">
                    <h5>Üretim Grafiği</h5>
                    <Chart type="line" :data="productionChartData" :options="comparisonChartOptions" class="h-20rem" />
                </div>
            </div>
            <div class="col-12 xl:col-6">
                <div class="card">
                    <h5>Karsilastirma Tablosu</h5>
                    <Chart type="line" :data="comparisonChartData" :options="comparisonChartOptions" class="h-20rem" />
                </div>
            </div>
            <div class="col-12 xl:col-6">
                <div class="card flex flex-column align-items-center">
                    <h5 class="text-left w-full">Pie Chart</h5>
                    <Chart type="pie" :data="pieData" :options="pieOptions"></Chart>
                </div>
            </div>
        </div>
    </div>
</template>
