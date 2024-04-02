const crypto = require('crypto');

/**
 * Распарсивание строки initData, полученой от MiniApp
 * @param {string} initData параметр, полученный от приложения
 * @returns
 */
function dataCheck(initData) {
  const searchParams = new URLSearchParams(initData);
  const query_id = searchParams.get('query_id');
  const hash = searchParams.get('hash');

  if (!query_id && !hash) return false
  
  searchParams.delete('hash');
  const restKeys = Array.from(searchParams.entries());
  const sortKeys = restKeys.sort((aK, bK) => aK[0].localeCompare(bK[0]))
  let data_check_string = sortKeys.map((list) => `${list[0]}=${list[1]}`).join('\n')

  return {
    query_id,
    hash,
    data_check_string
  }
}

/**
 * Проверка данных, полученных через мини-приложение
 * @param {string} token токен бота
 * @param {string} data_check_string - готовая строка для проверки данных из initData
 * @param {string} hash - выделенный хеш из initData
 * @returns 
 */
function validationKey (token, data_check_string, hash) {
  const secret_key = crypto.createHmac('sha256', 'WebAppData').update(token).digest();
  const validation_key = crypto.createHmac('sha256', secret_key).update(data_check_string).digest('hex');
  return validation_key === hash
}

module.exports = {
  dataCheck,
  validationKey
}
