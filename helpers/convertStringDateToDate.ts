export const convertStringDateToDate = (stringDate: string): string => {
    let date = new Date(parseInt(stringDate))
    return date.getDay() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear()
}