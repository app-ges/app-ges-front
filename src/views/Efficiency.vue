<script setup>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';

const distributions = ref([]);
const selectedDistribution = ref(null);
const counters = ref([]);
const selectedCounter = ref(null);
const years = ref([]);
const selectedYear = ref(null);
const types = ref([
    { label: 'Miktar', value: 'amount' },
    { label: 'Yüzdelik', value: 'percent' }
]);
const selectedType = ref(null);
const efficiencyData = ref(null);
const loading = ref(false);

const barData = ref(null);
const barOptions = ref(null);

onMounted(async () => {
    await fetchDistributions();
    setupYears();
    setColorOptions();
});

function setupYears() {
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 5; i++) {
        years.value.push({ label: currentYear - i, value: currentYear - i });
    }
}

async function fetchDistributions() {
    const user = JSON.parse(localStorage.getItem('user'));

    try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/v2/user-distributions`, {
            headers: {
                'Content-type': 'application/json',
                Authorization: `Bearer ${user.token}`
            }
        });
        distributions.value = response.data.data.map((item) => ({
            label: item.name,
            value: item.id
        }));
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

watch(selectedDistribution, async (newValue) => {
    if (newValue) {
        await fetchCounters(newValue);
    }
});

async function fetchCounters(distribution) {
    const id = distribution.value;
    const user = JSON.parse(localStorage.getItem('user'));

    try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/v2/counters?distributionId=${id}&type=BASE`, {
            headers: {
                'Content-type': 'application/json',
                Authorization: `Bearer ${user.token}`
            }
        });
        counters.value = response.data.items.map((item) => ({
            label: item.name,
            value: item.id
        }));
    } catch (error) {
        console.error('Error fetching counters:', error);
    }
}

async function fetchData() {
    const counterId = selectedCounter.value.value;
    const year = selectedYear.value.value;
    const type = selectedType.value.value;
    const user = JSON.parse(localStorage.getItem('user'));
    loading.value = true;

    try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/v2/efficiency?counterId=${counterId}&year=${year}&type=${type}`, {
            headers: {
                'Content-type': 'application/json',
                Authorization: `Bearer ${user.token}`
            }
        });
        efficiencyData.value = response.data.data;
        const counterEfficiency = efficiencyData.value.counter_efficiency.map((value) => parseFloat(value));
        const regionalEfficiency = efficiencyData.value.regional_efficiency.map((value) => parseFloat(value));

        setChart(counterEfficiency, regionalEfficiency);
    } catch (error) {
        console.error('Error fetching efficiency data:', error);
    } finally {
        loading.value = false;
    }
}

let documentStyle = getComputedStyle(document.documentElement);
let textColor = documentStyle.getPropertyValue('--text-color');
let textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
let surfaceBorder = documentStyle.getPropertyValue('--surface-border');

const setColorOptions = () => {
    documentStyle = getComputedStyle(document.documentElement);
    textColor = documentStyle.getPropertyValue('--text-color');
    textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    surfaceBorder = documentStyle.getPropertyValue('--surface-border');
};

const setChart = (counterEfficiencyData, regionalEfficiencyData) => {
    barData.value = {
        labels: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
        datasets: [
            {
                label: 'Sayaç Verimliliği',
                backgroundColor: documentStyle.getPropertyValue('--primary-500'),
                borderColor: documentStyle.getPropertyValue('--primary-500'),
                data: counterEfficiencyData.map((value) => parseFloat(value))
            },
            {
                label: 'Bölgesel Verimlilik',
                backgroundColor: documentStyle.getPropertyValue('--primary-200'),
                borderColor: documentStyle.getPropertyValue('--primary-200'),
                data: regionalEfficiencyData.map((value) => parseFloat(value))
            }
        ]
    };
    barOptions.value = {
        plugins: {
            legend: {
                labels: {
                    fontColor: textColor
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: textColorSecondary,
                    font: {
                        weight: 500
                    }
                },
                grid: {
                    display: false,
                    drawBorder: false
                }
            },
            y: {
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder,
                    drawBorder: false
                }
            }
        }
    };
};
</script>

<template>
    <div class="p-3 bg-white border-2 border-gray-100 mb-3">
        <div>
            <div class="toolbar">
                <Dropdown id="dropdown" v-model="selectedDistribution" :options="distributions" optionLabel="label" placeholder="Dağıtım/OSB şirketi" />
                <Dropdown id="dropdown" v-model="selectedCounter" :options="counters" optionLabel="label" placeholder="Brüt Sayac" />
                <Dropdown id="dropdown" v-model="selectedYear" :options="years" optionLabel="label" placeholder="Yıl" />
                <Dropdown id="dropdown" v-model="selectedType" :options="types" optionLabel="label" placeholder="Gösterim Türü" />
                <Button @click="fetchData" label="GETIR" class="p-button" style="flex-grow: 1"></Button>
            </div>
            <div v-if="loading" class="loading-indicator">Loading...</div>
        </div>
        <div v-if="efficiencyData && !loading">
            <div class="card">
                <h5>Bar Chart</h5>
                <Chart type="bar" :data="barData" :options="barOptions"></Chart>
            </div>
        </div>
        <div v-else></div>
    </div>
</template>

<style scoped>
.toolbar {
    display: flex;
    align-items: center;
    gap: 1rem;
    align-items: baseline;
    flex-wrap: wrap;
    margin-bottom: 1rem;
}

@media only screen and (min-width: 961px) {
    #dropdown {
        width: 20%;
    }
}
</style>
