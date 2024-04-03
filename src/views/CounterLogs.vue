<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import * as XLSX from 'xlsx';

onMounted(fetchCounters);

const selectedCategory = ref('gn_value');
const categories = ref([
    { name: 'Veriş', key: 'gn_value' },
    { name: 'Çekiş', key: 'cn_value' }
]);

const months = ref([
    { name: 'Ocak', code: '1' },
    { name: 'Şubat', code: '2' },
    { name: 'Mart', code: '3' },
    { name: 'Nisan', code: '4' },
    { name: 'Mayıs', code: '5' },
    { name: 'Haziran', code: '6' },
    { name: 'Temmuz', code: '7' },
    { name: 'Ağustos', code: '8' },
    { name: 'Eylül', code: '9' },
    { name: 'Ekim', code: '10' },
    { name: 'Kasım', code: '11' },
    { name: 'Aralık', code: '12' }
]);
const currentYear = new Date().getFullYear();
const yearsList = Array.from({ length: 11 }, (_, index) => ({ name: `${currentYear - index}`, code: `${currentYear - index}` }));

const years = ref(yearsList);
const selectedMonth = ref(new Date().getMonth() + 1);
const selectedYear = ref(new Date().getFullYear());

const startDate = ref('');
const endDate = ref('');
const logs = ref([]);
const loading = ref(false);
const error = ref('');
const exportError = ref('');

const daysInMonth = ref([]);

const counters = ref([]);
const selectedCounter = ref('');

const updateDate = () => {
    const lastDayOfMonth = new Date(selectedYear.value.code, selectedMonth.value.code, 0).getDate();
    const startDateString = `${selectedYear.value.code}-${selectedMonth.value.code}-01`;
    const endDateString = `${selectedYear.value.code}-${selectedMonth.value.code}-${lastDayOfMonth}`;
    startDate.value = startDateString;
    endDate.value = endDateString;
    daysInMonth.value = Array.from({ length: lastDayOfMonth }, (_, i) => i + 1);
};

async function fetchCounters() {
    const user = JSON.parse(localStorage.getItem('user'));

    try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/v2/counters`, {
            headers: {
                'Content-type': 'application/json',
                Authorization: `Bearer ${user.token}`
            }
        });

        const data = response.data;
        if (data.success) {
            counters.value = data.items.map((item) => ({
                label: item.name,
                value: item.id
            }));
        } else {
            throw new Error('Request failed');
        }
    } catch (error) {
        console.error('Error fetching counters:', error);
    }
}
const fetchData = async (selectedCounter) => {
    loading.value = true;
    error.value = '';
    exportError.value = '';

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user.token) {
        error.value = 'Bearer token not found in localStorage';
        loading.value = false;
        return;
    }

    try {
        const response = await axios.post(
            `https://panel.test.app-ges.com/panel/v2/counter-logs/${selectedCounter}`,
            {
                start_date: startDate.value,
                end_date: endDate.value
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`
                }
            }
        );

        if (!response.data.success) {
            throw new Error(response.data.message || 'Request failed');
        }

        logs.value = response.data.data;
    } catch (err) {
        console.error('Error fetching data:', err);
        error.value = err.message;
    } finally {
        loading.value = false;
    }
};

const onSortChange = (selectedCounter) => {
    fetchData(selectedCounter.value);
};

fetchCounters();

const getLogValueForHourDay = (hour, day) => {
    const formattedHour = hour.padStart(2, '0');
    const log = logs.value.find((log) => {
        const logDate = new Date(log.date);
        return logDate.getDate() === day && logDate.getHours() === parseInt(formattedHour);
    });
    return log ? log[selectedCategory.value] : '-';
};

const getTotalForHour = (hour) => {
    if (hour === 'Total') {
        return logs.value
            .reduce((acc, log) => {
                const selectedLogValue = parseFloat(log[selectedCategory.value]);
                return acc + selectedLogValue;
            }, 0)
            .toFixed(2);
    }

    const formattedHour = hour.padStart(2, '0');
    const logsForHour = logs.value.filter((log) => new Date(log.date).getHours() === parseInt(formattedHour));
    const total = logsForHour.reduce((acc, log) => {
        const selectedLogValue = parseFloat(log[selectedCategory.value]);
        return acc + selectedLogValue;
    }, 0);
    return total.toFixed(2);
};

const getSumForDay = (day) => {
    const logsForDay = logs.value.filter((log) => new Date(log.date).getDate() === day);
    const totalForDay = logsForDay.reduce((acc, log) => {
        const selectedLogValue = parseFloat(log[selectedCategory.value]);
        return acc + selectedLogValue;
    }, 0);
    return totalForDay.toFixed(2);
};

const getSumForHour = (hour) => {
    if (hour === 'Total') {
        const total = logs.value.reduce((acc, log) => {
            const selectedLogValue = parseFloat(log[selectedCategory.value]);
            return acc + selectedLogValue;
        }, 0);
        return total.toFixed(2);
    }
};

const exportToExcel = () => {
    if (logs.value.length === 0) {
        exportError.value = 'Veri henüz alınmadı. Lütfen önce veriyi alın.';
        return;
    }

    const worksheet = XLSX.utils.table_to_sheet(document.querySelector('table'));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, 'tablo_data.xlsx');
};

const exportToExcelSingleColumn = () => {
    if (logs.value.length === 0) {
        exportError.value = 'Veri henüz alınmadı. Lütfen önce veriyi alın.';
        return;
    }

    const exportData = [];

    logs.value.forEach((log) => {
        const date = new Date(log.date).toLocaleDateString('en-GB');

        const exportEntry = {
            Date: date
        };

        exportEntry[selectedCategory.value] = log[selectedCategory.value];

        exportData.push(exportEntry);
    });

    const categoryTotal = exportData.reduce((acc, entry) => acc + parseFloat(entry[selectedCategory.value] || 0), 0).toFixed(2);

    const lastRow = {
        Date: 'Total',
        [selectedCategory.value]: categoryTotal
    };

    exportData.push(lastRow);

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    XLSX.writeFile(workbook, `${selectedCategory.value}.xlsx`);
};
</script>

<template>
    <div class="p-3 bg-white border-2 border-gray-100 mb-3">
        <div>
            <div class="toolbar">
                <Dropdown id="dropdown" v-model="selectedCounter" :options="counters" optionLabel="label" placeholder="Sayaçlar" class="mb-5" v-show="counters.length" />
                <Dropdown id="dropdown" v-model="selectedMonth" :options="months" optionLabel="name" placeholder="Ay Seçin" @change="updateDate" />
                <Dropdown id="dropdown" v-model="selectedYear" :options="years" optionLabel="name" placeholder="Yıl Seçin" @change="updateDate" />
                <div class="grid">
                    <div class="col-12 md:col-4">
                        <div class="field-radiobutton mb-0 gap-3">
                            <div v-for="category in categories" :key="category.key" class="flex align-items-center">
                                <RadioButton v-model="selectedCategory" :inputId="category.key" name="dynamic" :value="category.key" />
                                <label :for="category.key" class="ml-2">{{ category.name }}</label>
                            </div>
                        </div>
                    </div>
                </div>
                <Button @click="onSortChange(selectedCounter)" label="Sayaç Okuma Verilerini Al"></Button>
                <Button @click="exportToExcel" label="Tabloyu Dışa Aktar"></Button>
                <Button @click="exportToExcelSingleColumn" label="Tek Sütunlu Excel'e Aktar"></Button>
            </div>
        </div>

        <div v-if="exportError">{{ exportError }}</div>
        <div v-if="loading">Loading...</div>
        <div v-else-if="error">Error: {{ error }}</div>
        <div v-else>
            <div v-if="logs.length > 0" class="overflow-x-auto mt-4">
                <table class="table-auto min-w-full" style="border-collapse: collapse; border: 1px solid #dee2e6">
                    <thead>
                        <tr>
                            <th class="px-4 py-2">Saat/Gün</th>
                            <th v-for="day in daysInMonth" :key="day" class="px-4 py-2" style="border-collapse: collapse; border: 1px solid #dee2e6">{{ day }}</th>
                            <th class="px-4 py-2">Toplam</th>
                        </tr>
                    </thead>
                    <tbody style="border-collapse: collapse; border: 1px solid #dee2e6">
                        <tr
                            v-for="hour in Array(24)
                                .fill(null)
                                .map((_, idx) => idx.toString().padStart(2, '0'))"
                            :key="hour"
                            style="border-collapse: collapse; border: 1px solid #dee2e6"
                        >
                            <td class="px-4 py-2">{{ hour }}</td>
                            <td v-for="day in daysInMonth" :key="day" class="px-4 py-2" style="border-collapse: collapse; border: 1px solid #dee2e6">{{ getLogValueForHourDay(hour, day) }}</td>
                            <td class="px-4 py-2">{{ getTotalForHour(hour) }}</td>
                        </tr>
                        <tr>
                            <td class="px-4 py-2">Toplam</td>
                            <td v-for="day in daysInMonth" :key="day" class="px-4 py-2" style="border-collapse: collapse; border: 1px solid #dee2e6">{{ getSumForDay(day) }}</td>
                            <td class="px-4 py-2">{{ getSumForHour('Total') }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
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
</style>
