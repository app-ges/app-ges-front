<script setup>
import { ref } from 'vue';

import AppMenuItem from './AppMenuItem.vue';

const model = ref([
    {
        label: 'Home',
        items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/dashboard' }]
    },
    {
        // label: 'UI Components',
        items: [
            { label: 'Sayaç Okumaları', icon: 'pi pi-fw pi-id-card', to: '/counter-logs' },
            { label: 'Genel Alarmlar', icon: 'pi pi-fw pi-check-square', to: '/uikit/input' },
            {
                label: 'Sayaç Arıza Takibi',
                icon: 'pi pi-fw pi-align-left',
                items: [
                    {
                        label: 'Sayaç Zaman Hatası',
                        icon: 'pi pi-fw pi-bookmark',
                        to: '/uikit/input'
                    },
                    {
                        label: 'Eksik Sayaç Okuma Hatası',
                        icon: 'pi pi-fw pi-bookmark',
                        to: '/uikit/input'
                    }
                ]
            },
            {
                label: 'Güç Aşımı Takibi',
                icon: 'pi pi-fw pi-align-left',
                items: [
                    {
                        label: 'Güç Aşımı Takibi Üretim',
                        icon: 'pi pi-fw pi-bookmark',
                        to: '/uikit/input'
                    },
                    {
                        label: 'Eksik Sayaç Okuma Hatası',
                        icon: 'pi pi-fw pi-bookmark',
                        to: '/uikit/input'
                    }
                ]
            },
            { label: 'Reaktif Kapasitif', icon: 'pi pi-fw pi-bookmark', to: '/uikit/floatlabel' },
            { label: 'Ay Sonu Endeksi Kontrol Tablosu', icon: 'pi pi-fw pi-exclamation-circle', to: '/uikit/invalidstate' },
            {
                label: 'Karbon Ayak İzi',
                icon: 'pi pi-fw pi-align-left',
                items: [
                    {
                        label: 'Salınan Karbon Ayak İzi',
                        icon: 'pi pi-fw pi-bookmark',
                        to: '/uikit/input'
                    },
                    {
                        label: 'Nötrlenen Karbon Ayak İzi',
                        icon: 'pi pi-fw pi-bookmark',
                        to: '/uikit/input'
                    },
                    {
                        label: 'Genel Durum',
                        icon: 'pi pi-fw pi-bookmark',
                        to: '/uikit/input'
                    },
                    {
                        label: 'Veri Gir',
                        icon: 'pi pi-fw pi-bookmark',
                        to: '/uikit/input'
                    }
                ]
            },
            { label: 'Maliyet Raporlama', icon: 'pi pi-fw pi-mobile', to: '/uikit/button', class: 'rotated-icon' },
            { label: 'Faturalama', icon: 'pi pi-fw pi-table', to: '/uikit/table' },
            { label: 'Verimlilik', icon: 'pi pi-fw pi-list', to: '/uikit/list' },
            { label: 'Bildirim Ayarları', icon: 'pi pi-fw pi-share-alt', to: '/uikit/tree' },
            { label: 'Şirket Bilgisi Ekleme', icon: 'pi pi-fw pi-tablet', to: '/uikit/panel' },
            { label: 'Sayaç Bilgisi Tanımlama', icon: 'pi pi-fw pi-clone', to: '/uikit/overlay' }
        ]
    }
]);
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
