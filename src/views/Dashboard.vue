<script setup>
import { onMounted, ref } from 'vue';

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

        const response = await fetch(`${import.meta.env.VITE_API_URL}/v2/counters`, {
            headers: {
                Authorization: `Bearer ${user.token}`
            }
        });

        const data = await response.json();
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
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

async function fetchWidgetData(itemID, token) {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/v2/dashboard/${itemID}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const data = await response.json();
        widgetsData.value = data;
        console.log(widgetsData.value);
    } catch (error) {
        console.log('Error fetching dashboard data:', error);
    }
}

async function fetchProductionChartData(itemID, token) {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/v2/daily-generation/${itemID}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const data = await response.json();
        productionChartData.value = setProductionChartData(data);
        productionChartOptions.value = setcomparisonChartOptions();
    } catch (error) {
        console.error('Error fetching comparison chart data:', error);
        return null;
    }
}

async function fetchcomparisonChartData(itemID, token) {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/v2/comparison-report/${itemID}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const data = await response.json();
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
</script>

<template>
    <Dropdown v-model="sortKey" :options="counters" optionLabel="label" placeholder="Counters" @change="onSortChange($event)" class="mb-5" v-show="counters.length" />
    <div class="grid">
        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Üretim Miktarı</span>
                        <div class="text-900 font-medium text-xl">Sayaç: {{ widgetsData?.data.production_sum }}</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-blue-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-shopping-cart text-blue-500 text-xl"></i>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-1">Maliyet Değişimi</span>
                        <span class="block text-400 font-medium mb-3">(Bir Önceki Aya Göre)</span>
                        <div class="text-900 font-medium text-xl">{{ widgetsData?.data.cost_change_from_last_month }}</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-orange-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-map-marker text-orange-500 text-xl"></i>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Fatura Durumu</span>
                        <div class="text-900 font-medium text-xl">{{ widgetsData?.data.estimated_bill }}</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-cyan-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-inbox text-cyan-500 text-xl"></i>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Birim Maliyet</span>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-purple-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-comment text-purple-500 text-xl"></i>
                    </div>
                </div>
                <div class="flex flex-column gap-1">
                    <span class="text-500">KDV Hariç Birim Maliyet</span>
                    <span class="text-green-500 font-medium">{{ widgetsData?.data.unit_cost_without_vat }}</span>
                    <span class="text-500">KDV Dahil Birim Maliyet</span>
                    <span class="text-green-500 font-medium">{{ widgetsData?.data.unit_cost_with_vat }}</span>
                </div>
            </div>
        </div>
        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-1">Tahmini Fatura Durumu</span>
                        <span class="block text-400 font-medium mb-3">(Bir Önceki Aya Göre)</span>
                        <div class="text-900 font-medium text-xl">{{ widgetsData?.data.estimated_bill }}</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-cyan-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-inbox text-cyan-500 text-xl"></i>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Ges TL Bazlı Getirisi</span>
                        <div class="text-900 font-medium text-xl">{{ widgetsData?.data.ges_tl_income }}</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-cyan-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-inbox text-cyan-500 text-xl"></i>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">Ges Dolar Bazlı Getirisi</span>
                        <div class="text-900 font-medium text-xl">{{ widgetsData?.data.ges_usd_income }}</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-cyan-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-inbox text-cyan-500 text-xl"></i>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0">
                <div class="flex justify-content-between mb-3">
                    <div>
                        <span class="block text-500 font-medium mb-3">İşletme Tüketiminin Ges'ten Karşılanma Oranı</span>
                        <div class="text-900 font-medium text-xl">{{ widgetsData?.data.ges_coverage_rate }}</div>
                    </div>
                    <div class="flex align-items-center justify-content-center bg-cyan-100 border-round" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-inbox text-cyan-500 text-xl"></i>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-12 xl:col-6">
            <div class="card">
                <h5>Üretim Grafiği</h5>
                <Chart type="line" :data="productionChartData" :options="comparisonChartOptions" class="h-30rem" />
            </div>
            <div class="card">
                <h5>Karsilastirma Tablosu</h5>
                <Chart type="line" :data="comparisonChartData" :options="comparisonChartOptions" class="h-30rem" />
            </div>
        </div>
    </div>
</template>