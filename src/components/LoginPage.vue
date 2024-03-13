<template>
  <section class="bg-gray-50">
    <div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
      <a href="/" class="flex items-center mb-6 text-2xl font-semibold text-gray-900">
        <img class="w-8 h-8 mr-2" src="/images/logo.png" alt="logo" />
        Appp Ges
      </a>
      <div class="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
        <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
          <h1
            class="text-center text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl"
          >
            Hesabınıza Giriş Yapın
          </h1>
          <p class="text-center text-sm">Giriş yapmak için Kullanıcı adı ve şifreinizi giriniz.</p>
          <form class="space-y-4 md:space-y-6" @submit.prevent="login">
            <div>
              <label for="username" class="block mb-2 text-sm font-medium text-gray-900"
                >Kullanıcı Adı</label
              >
              <input
                type="username"
                name="username"
                id="username"
                placeholder="admin"
                class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5"
                v-model="username"
                required
              />
            </div>
            <div>
              <label for="password" class="block mb-2 text-sm font-medium text-gray-900"
                >Şifre</label
              >
              <input
                type="password"
                name="password"
                id="password"
                placeholder="••••••••"
                class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5"
                v-model="password"
                required
              />
            </div>
            <button
              type="submit"
              class="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
            >
              Sign in
            </button>
            <p class="text-sm font-light text-gray-500">
              Hesabınız yok mu?
              <a href="/register" class="font-medium text-blue-600 hover:underline">Üye olmak</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const username = ref('')
const password = ref('')
const errorMessage = ref('')

const router = useRouter()

const login = async () => {
  if (username.value && password.value) {
    try {
      const response = await fetch('https://panel.test.app-ges.com/panel/v2/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: username.value,
          password: password.value
        })
      })
      if (response.ok) {
        const data = await response.json()
        console.log('Giriş başarılı', data)
        username.value = ''
        password.value = ''
        errorMessage.value = ''

        await router.push('/panel')
      } else {
        const errorData = await response.json()
        console.error('Giriş başarısız oldu:', errorData)
        errorMessage.value = errorData.message || 'Giriş başarısız oldu'
      }
    } catch (error) {
      console.error('Sisteme giriş hatası:', error)
      errorMessage.value = 'Oturum açma sırasında bir hata oluştu'
    }
  } else {
    errorMessage.value = 'Lütfen kullanıcı adınızı ve şifrenizi girin'
  }
}
</script>
