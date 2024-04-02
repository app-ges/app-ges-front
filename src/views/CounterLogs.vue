<script setup>
import { ref } from 'vue';

const selectedCategory = ref('gn_value');
const categories = ref([
    { name: 'Veriş', key: 'gn_value' },
    { name: 'Çekiş', key: 'cn_value' }
]);

const months = ref([
    { name: 'January', code: '1' },
    { name: 'February', code: '2' },
    { name: 'March', code: '3' },
    { name: 'April', code: '4' },
    { name: 'May', code: '5' },
    { name: 'June', code: '6' },
    { name: 'July', code: '7' },
    { name: 'August', code: '8' },
    { name: 'September', code: '9' },
    { name: 'October', code: '10' },
    { name: 'November', code: '11' },
    { name: 'December', code: '12' }
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

const daysInMonth = ref([]);

const updateDate = () => {
    const lastDayOfMonth = new Date(selectedYear.value.code, selectedMonth.value.code, 0).getDate();
    const startDateString = `${selectedYear.value.code}-${selectedMonth.value.code}-01`;
    const endDateString = `${selectedYear.value.code}-${selectedMonth.value.code}-${lastDayOfMonth}`;
    startDate.value = startDateString;
    endDate.value = endDateString;
    daysInMonth.value = Array.from({ length: lastDayOfMonth }, (_, i) => i + 1);
};

const fetchData = async () => {
    loading.value = true;
    error.value = '';

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user.token) {
        error.value = 'Bearer token not found in localStorage';
        loading.value = false;
        return;
    }

    try {
        const response = await fetch('https://panel.test.app-ges.com/panel/v2/counter-logs/63149d1e3c83a2b2c3fdc7fa', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${user.token}`
            },
            body: JSON.stringify({ start_date: startDate.value, end_date: endDate.value })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        logs.value = responseData.data;
    } catch (err) {
        error.value = err.message;
    } finally {
        loading.value = false;
    }
};

// Modify the getLogValueForHourDay method to display selected value
const getLogValueForHourDay = (hour, day) => {
    // Convert hour from string to number with leading zero padding
    const formattedHour = hour.padStart(2, '0');
    const log = logs.value.find((log) => {
        const logDate = new Date(log.date);
        return logDate.getDate() === day && logDate.getHours() === parseInt(formattedHour);
    });
    return log ? log[selectedCategory.value] : '-';
};

const getTotalForHour = (hour) => {
    // Handle potential 'Total' case
    if (hour === 'Total') {
        return logs.value
            .reduce((acc, log) => {
                const selectedLogValue = parseFloat(log[selectedCategory.value]);
                return acc + selectedLogValue;
            }, 0)
            .toFixed(2);
    }

    // Convert hour from string to number with leading zero padding
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
    const sum = logsForDay.reduce((acc, log) => {
        const selectedLogValue = parseFloat(log[selectedCategory.value]);
        return acc + selectedLogValue;
    }, 0);
    return sum.toFixed(2);
};

const getSumForHour = (hour) => {
    const logsForHour = logs.value.filter((log) => new Date(log.date).getHours() === hour);
    const sum = logsForHour.reduce((acc, log) => {
        const selectedLogValue = parseFloat(log[selectedCategory.value]);
        return acc + selectedLogValue;
    }, 0);
    return sum.toFixed(2);
};
</script>

<template>
    <div class="pt-3 px-3 bg-white border-2 border-gray-100 mb-3">
        <div>
            <div class="flex gap-2">
                <Dropdown id="dropdown" v-model="selectedMonth" :options="months" optionLabel="name" placeholder="Select Month" @change="updateDate" class="mb-5" />
                <Dropdown id="dropdown" v-model="selectedYear" :options="years" optionLabel="name" placeholder="Select Year" @change="updateDate" class="mb-5" />
            </div>

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

            <button @click="fetchData">Fetch Data</button>
        </div>

        <div v-if="loading">Loading...</div>
        <div v-else-if="error">Error: {{ error }}</div>
        <div v-else>
            <div v-if="logs.length > 0" class="overflow-x-auto mt-4">
                <table class="table-auto min-w-full border-collapse border border-black">
                    <thead>
                        <tr>
                            <th class="px-4 py-2 border-1">Saat/Gün</th>
                            <th v-for="day in daysInMonth" :key="day" class="px-4 py-2 border-1">{{ day }}</th>
                            <th class="px-4 py-2 border-1">Toplam</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="hour in Array(24)
                                .fill(null)
                                .map((_, idx) => idx.toString().padStart(2, '0'))"
                            :key="hour"
                        >
                            <td class="px-4 py-2 border-1">{{ hour }}</td>
                            <td v-for="day in daysInMonth" :key="day" class="px-4 py-2 border-1">{{ getLogValueForHourDay(hour, day) }}</td>
                            <td class="px-4 py-2 border-1">{{ getTotalForHour(hour) }}</td>
                        </tr>
                        <tr>
                            <td class="px-4 py-2 border-1">Toplam</td>
                            <td v-for="day in daysInMonth" :key="day" class="px-4 py-2 border-1">{{ getSumForDay(day) }}</td>
                            <td class="px-4 py-2 border-1">{{ getSumForHour('Total') }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>
