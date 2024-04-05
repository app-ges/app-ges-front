<script setup>
import { useLayout } from '@/layout/composables/layout';
import { ref, computed } from 'vue';
import axios from 'axios';

const { layoutConfig } = useLayout();
const email = ref('');
const username = ref('');
const phone = ref('');
const password = ref('');
const successMessage = ref('');
const errorMessage = ref('');
const checked = ref(false);

const signUp = async () => {
    if (email.value && username.value && phone.value && password.value) {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/v2/auth/register`,
                {
                    body: JSON.stringify({
                        email: email.value,
                        username: username.value,
                        phone: phone.value,
                        password: password.value
                    })
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.ok) {
                const data = await response.data;
                console.log('Giriş başarılı', data);
                successMessage.value = data.message;
                email.value = '';
                username.value = '';
                phone.value = '';
                password.value = '';
                errorMessage.value = '';
            } else {
                const errorData = await response.json();
                console.error('Kayıt başarısız:', errorData);
                errorMessage.value = errorData.message || 'Kayıt başarısız';
            }
        } catch (error) {
            console.error('Sistem kayıt hatası:', error);
            errorMessage.value = 'Kayıt sırasında bir hata oluştu';
        }
    } else {
        errorMessage.value = 'Lütfen gerekli tüm bilgileri girin';
    }
};

const logoUrl = computed(() => {
    return `/layout/images/${layoutConfig.darkTheme.value ? 'logo-white' : 'logo-dark'}.png`;
});
</script>

<template>
    <div class="surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
        <div class="flex flex-column align-items-center justify-content-center">
            <img :src="logoUrl" alt="Sakai logo" class="mb-5 w-6rem flex-shrink-0" />
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full surface-card py-8 px-5 sm:px-8" style="border-radius: 53px">
                    <div class="text-center mb-5">
                        <div class="text-900 text-3xl font-medium mb-3">Hesap Oluştur</div>
                        <span class="text-600 font-medium">Lütfen Bilgilerinizi giriniz</span>
                    </div>

                    <form @submit.prevent="signUp">
                        <label for="email" class="block text-900 text-xl font-medium mb-2">Email Adresiniz</label>
                        <InputText id="email" type="text" placeholder="Email Adresiniz" class="w-full md:w-30rem mb-5" style="padding: 1rem" v-model="email" />

                        <label for="username" class="block text-900 text-xl font-medium mb-2">Kullanıcı Adı</label>
                        <InputText id="username" type="text" placeholder="Kullanıcı Adı" class="w-full md:w-30rem mb-5" style="padding: 1rem" v-model="username" />

                        <label for="username" class="block text-900 text-xl font-medium mb-2">Telefon Numaranız</label>
                        <InputMask id="phone" type="phone" v-model="phone" mask="99-9999999999" placeholder="99-9999999999" class="w-full md:w-30rem mb-5" style="padding: 1rem" />

                        <label for="password" class="block text-900 font-medium text-xl mb-2">Şifre</label>
                        <Password id="password" v-model="password" placeholder="Şifre" :toggleMask="true" class="w-full mb-3" inputClass="w-full" inputId="password" :inputStyle="{ padding: '1rem' }"></Password>

                        <div class="flex align-items-center justify-content-between mb-5 gap-5">
                            <div class="flex align-items-center">
                                <Checkbox v-model="checked" id="rememberme" binary class="mr-2" inputId="rememberme"></Checkbox>
                                <label for="rememberme">Beni Hatırla</label>
                            </div>
                            <a href="/auth/login" class="font-medium no-underline ml-2 text-right cursor-pointer" style="color: var(--primary-color)">Giriş Yap</a>
                        </div>
                        <Button label="Hesap Oluştur" type="submit" class="w-full p-3 text-xl"></Button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.pi-eye {
    transform: scale(1.6);
    margin-right: 1rem;
}

.pi-eye-slash {
    transform: scale(1.6);
    margin-right: 1rem;
}
</style>
