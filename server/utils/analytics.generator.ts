import { Document, Model } from "mongoose";

interface MonthData {
    month: string;
    count: number;
}

export const generateLast12MonthsData = async <T extends Document>(
    model: Model<T>
): Promise<{ last12Months: MonthData[] }> => {
    const last12Months: MonthData[] = [];
    const currentDate = new Date();
    
    // Start from the current month and go back 12 months
    for (let i = 11; i >= 0; i--) {
        // Calculate the month we're processing
        const targetMonth = currentDate.getMonth() - i;
        const targetYear = currentDate.getFullYear();
        
        // Calculate the start date of the month (first day at 00:00:00.000)
        const startDate = new Date(targetYear, targetMonth, 1, 0, 0, 0, 0);
        
        // Calculate the end date of the month (last day at 23:59:59.999)
        const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);

        // Format month and year for display
        const monthYear = startDate.toLocaleString("default", {
            month: "short",
            year: "numeric",
        });

        // Count documents created in this month
    const count = await model.countDocuments({
            createdAt: {
                $gte: startDate,
                $lte: endDate,
            },
        });

        // Add to results array
        last12Months.push({
            month: monthYear,
            count,
    });
   }
   

    return { last12Months };
};