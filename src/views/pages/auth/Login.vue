<script setup>
import { useLayout } from '@/layout/composables/layout';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { signIn } from '@/stores/auth';

const { layoutConfig } = useLayout();
const username = ref('');
const password = ref('');
const checked = ref(false);
const router = useRouter();

const handleSignin = async () => {
    await signIn(username.value, password.value, router);
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
                        <div class="text-900 text-3xl font-medium mb-3">Hesabınıza Giriş Yapın</div>
                        <span class="text-600 font-medium">Giriş yapmak için Kullanıcı adı ve şifreinizi giriniz.</span>
                    </div>

                    <form @submit.prevent="handleSignin">
                        <label for="username" class="block text-900 text-xl font-medium mb-2">Kullanıcı Adı</label>
                        <InputText id="username" type="text" class="w-full md:w-30rem mb-5" style="padding: 1rem" v-model="username" />

                        <label for="password" class="block text-900 font-medium text-xl mb-2">Şifre</label>
                        <Password id="password" v-model="password" :toggleMask="true" class="w-full mb-3" inputClass="w-full" inputId="password" :inputStyle="{ padding: '1rem' }"></Password>

                        <div class="flex align-items-center justify-content-between mb-5 gap-5">
                            <div class="flex align-items-center">
                                <Checkbox v-model="checked" id="rememberme" binary class="mr-2" inputId="rememberme"></Checkbox>
                                <label for="rememberme">Beni Hatırla</label>
                            </div>
                            <a href="/auth/register" class="font-medium no-underline ml-2 text-right cursor-pointer" style="color: var(--primary-color)">Bir hesap oluştur.</a>
                        </div>
                        <Button label="Giriş" type="submit" class="w-full p-3 text-xl"></Button>
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
