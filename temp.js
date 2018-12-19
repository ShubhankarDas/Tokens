const input = [4, 13, 9, 5, 12, 13, 18, 12, 1, 3]

const square = a => a * a

const get = (arr) => {
  if (arr.length < 3) {
    return 'at least 3 elements are required!'
  }

  // sorting array in asc order
  arr.sort((a, b) => a - b)
  // variable to store the last square
  let c = 0
  for (let i = 0; i < arr.length - 2; i++) {
    for (let j = arr.length - 1; j > i; j--) {
      let t = square(arr[i]) + square(arr[j])
      if (t === c) {
        return true;
      }
      c = square(arr[j])
    }
  }
  return false
}

console.log(get(input))