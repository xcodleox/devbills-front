
import { Logo } from "../../components/logo";
import { Title } from "../../components/title";
import { Input } from "../../components/input";
import {
    Aside,
    Balance,
    CategoryBadge,
    ChartAction,
    ChartContainer,
    ChartContent,
    Filters,
    Header,
    InputGroup,
    Main,
    SearchTransaction,
    Section,
    Transactiongroup
} from "./styles";
import { InputMask } from "@react-input/mask";
import { ButtonIcon } from "../../components/button-icon";
import { Card } from "../../components/card";
import { Transaction } from "../../components/transaction";
//import { theme } from "../../styles/theme";
import { CreateCategoryDialog } from "../../components/create-category-dialog";
import { CreateTransactionDialog } from "../../components/create-transaction-dialog";
import { CategoriesPieChart, CategoryProps } from "../../components/categories-pie-chart";
import { FinancialEvolutionBarChart } from "../../components/financial-evolution-bar-chart";
import { useForm } from "react-hook-form";
import { FinancialEvolutionFilterData, TransactionsFilterData } from "../../validators/types";
import dayjs from "dayjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { transactionsFiltersSchema } from "../../validators/schemas";
import { useCallback, useEffect, useState } from "react";
import { useFetchAPI } from "../../hooks/useFetchAPI";
import { X } from "@phosphor-icons/react";

export function Home() {
    const transactionsFilterForm = useForm<TransactionsFilterData>({
        defaultValues: {
            title: '',
            categoryId: '',
            beginDate: dayjs().startOf('month').format('DD/MM/YYYY'),
            endDate: dayjs().endOf('month').format('DD/MM/YYYY')
        },

        resolver: zodResolver(transactionsFiltersSchema)
    })


    const financialEvolutionFilterForm = useForm<FinancialEvolutionFilterData>({
        defaultValues: {
            year: dayjs().get('year').toString(),
        }
    })

    const { 
        transactions, 
        dashboard, 
        financialEvolution, 
        fetchFinancialEvolution, 
        fetchTransactions, 
        fetchDashboard 
    } = useFetchAPI()

    useEffect(() => {
        const { beginDate, endDate } = transactionsFilterForm.getValues()
        fetchDashboard({ beginDate, endDate });
        fetchTransactions(transactionsFilterForm.getValues())
        fetchFinancialEvolution(financialEvolutionFilterForm.getValues())
    }, [
        fetchTransactions, 
        transactionsFilterForm, 
        fetchDashboard, 
        fetchFinancialEvolution, 
        financialEvolutionFilterForm
    ])


    const [selectedCategory, setSelectedCategory] = useState<CategoryProps | null>(null);

    const handleSelectCategory = useCallback(async ({ id, title, color }: CategoryProps) => {
        setSelectedCategory({ id, title, color });
        transactionsFilterForm.setValue('categoryId', id);

        await fetchTransactions(transactionsFilterForm.getValues())

    }, [transactionsFilterForm, fetchTransactions],
    );


    const handleDeselectCategory = useCallback(async () => {
        setSelectedCategory(null);
        transactionsFilterForm.setValue('categoryId', '');

        await fetchTransactions(transactionsFilterForm.getValues())

    }, [transactionsFilterForm, fetchTransactions],
    );

    const onSubmitTransactions = useCallback(async (data: TransactionsFilterData) => {
        await fetchTransactions(data)
    },
        [fetchTransactions]);


    const onSubmitDashboard = useCallback(async (data: TransactionsFilterData) => {
        const { beginDate, endDate } = data


        await fetchDashboard({ beginDate, endDate })
        await fetchTransactions(data)


    }, [fetchDashboard, fetchTransactions])


    const onSubmitFinancialEvolution = useCallback(async(data: FinancialEvolutionFilterData) => {
        await fetchFinancialEvolution(data)
    }, [fetchFinancialEvolution])

    return (<>
        <Header>
            <Logo />
            <div>
                <CreateTransactionDialog />
                <CreateCategoryDialog />
            </div>
        </Header>
        <Main>
            <Section>
                <Filters>
                    < Title title="Saldo" subtitle="Receitas e despesas no período" />
                    <InputGroup>
                        <InputMask
                            component={Input}
                            mask="dd/mm/aaaa"
                            replacement={{ d: /\d/, m: /\d/, a: /\d/ }}
                            variant="dark"
                            label="Inicio"
                            placeholder="dd/mm/aaaa"
                            //onError={transactionsFilterForm.formState.errors.beginDate?.message}
                            {...transactionsFilterForm.register('beginDate')}
                        />
                        <InputMask
                            component={Input}
                            mask="dd/mm/aaaa"
                            replacement={{ d: /\d/, m: /\d/, a: /\d/ }}
                            variant="dark"
                            label="Fim"
                            placeholder="dd/mm/aaaa"
                            //onError={transactionsFilterForm.formState.errors.endDate?.message}
                            {...transactionsFilterForm.register('endDate')}
                        />
                        <ButtonIcon onClick={transactionsFilterForm.handleSubmit(
                            onSubmitDashboard,
                        )} />
                    </InputGroup>
                </Filters>
                <Balance>
                    <Card title="Saldo" amount={dashboard?.balance?.balance || 0} />
                    <Card title="Receitas" amount={dashboard?.balance?.incomes || 0} variant="incomes" />
                    <Card title="Gastos" amount={dashboard?.balance?.expenses * -1 || 0} variant="expenses" />
                </Balance>
                <ChartContainer>
                    <header>
                        <Title
                            title="Gastos"
                            subtitle="Despesas por categoria no período" />
                            {selectedCategory && (
                                <CategoryBadge $color={selectedCategory.color}
                                onClick={handleDeselectCategory}>
                                    <X />
                                    {selectedCategory.title.toUpperCase()}
                                </CategoryBadge>
                            )}
                    </header>
                    <ChartContent>
                        <CategoriesPieChart
                            expenses={dashboard.expenses}
                            onClick={handleSelectCategory} />
                    </ChartContent>
                </ChartContainer>
                <ChartContainer>
                    <header>
                        <Title
                            title="Evolução Financeira"
                            subtitle="Saldo, Receitas e Gastos no ano" />

                        <ChartAction>
                            <InputMask
                                component={Input}
                                mask="dd/mm/aaaa"
                                replacement={{ d: /\d/, m: /\d/, a: /\d/ }}
                                variant="dark"
                                label="Ano"
                                placeholder="aaaa"
                                {...financialEvolutionFilterForm.register('year')}
                            />
                            <ButtonIcon  onClick={financialEvolutionFilterForm.handleSubmit(onSubmitFinancialEvolution)}
                            />
                        </ChartAction>

                    </header>
                    <ChartContent>
                        <FinancialEvolutionBarChart financialEvolution={financialEvolution}/>
                    </ChartContent>
                </ChartContainer>
            </Section>
            <Aside>
                <header>
                    <Title title="Transações" subtitle="Receitas e Gastos no período"
                    />
                    <SearchTransaction>
                        <Input
                            variant="black"
                            placeholder="Procurar Transação..."
                            {...transactionsFilterForm.register('title')}
                        />
                        <ButtonIcon
                            onClick={transactionsFilterForm.handleSubmit(
                                onSubmitTransactions,
                            )}
                        />
                    </SearchTransaction>
                </header>
                <Transactiongroup>
                    {transactions.length && transactions?.map((item, index) => (
                        <Transaction
                            key={item._id}
                            id={index + 1}
                            amount={item.type === 'expense' ? item.amount * -1 : item.amount}
                            date={dayjs(item.date).add(3, 'hours').format('DD/MM/YYYY')}
                            category={{ title: item.category.title, color: item.category.title }}
                            title={item.title}
                            variant={item.type}
                        />
                    ))}


                </Transactiongroup>
            </Aside>
        </Main>
    </>
    )
}