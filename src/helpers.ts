export const calculateProgress = (total: string, remainingAmount: string): string => {
  const percentage = ((parseFloat(total) - parseFloat(remainingAmount)) / parseFloat(total)) * 100

  return `${percentage === 0 ? 0 : Math.floor(100 - percentage)}`
}
