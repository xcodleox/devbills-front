import { useCallback, useEffect, useState } from "react";
import { Dialog } from "../dialog";
import { Button } from "../button";
import { Title } from "../title";
import { Input } from "../input";
import { Container, Content, CurrencyInput, ErrorMessage, InputGroup, RadioForm, RadioGroup } from "./styles";
import { InputMask } from "@react-input/mask";
import { useFetchAPI } from "../../hooks/useFetchAPI";
import { useForm } from "react-hook-form";
import { CreateTransactionData } from "../../validators/types";
import dayjs from "dayjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTransactionSchema } from "../../validators/schemas";

export function CreateTransactionDialog() {
    const { categories, fetchCategories, createTransaction } = useFetchAPI();
    const [open, setOpen] = useState(false);
    const { register, reset, formState: { errors }, handleSubmit } = useForm<CreateTransactionData>({
        defaultValues: {
            categoryId: 'null',
            title: '',
            amount: '',
            date: dayjs('2024-01-01').format('DD/MM/YYYY'),
            type: 'income',
        },

        resolver: zodResolver(createTransactionSchema)
    })

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories])


    const handleClose = useCallback(() => {
        reset()
        setOpen(false);
    }, [])



    const onSubmit = useCallback(async (data: CreateTransactionData) => {
        await createTransaction(data)
        handleClose();
    }, [handleClose, createTransaction])



    return (

        <Dialog open={open}
            onOpenChange={setOpen}
            trigger={<Button>Nova Transação</Button>}>
            <Container>
                <Title title="Nova Categoria" subtitle="Crie uma nova transação para controle financeiro" />

                <form onSubmit={handleSubmit(onSubmit)}>
                    <Content>
                        <InputGroup>
                            <label>Categoria</label>
                            <select {...register('categoryId')}>
                                <option value='null'>Selecione uma categoria</option>
                                {categories?.length && categories.map((item) => (
                                    <option key={item._id} value={item._id}>{item.title}</option>
                                ))}
                            </select>
                            {errors.categoryId && (
                                <ErrorMessage>{errors.categoryId.message}</ErrorMessage>
                            )}
                        </InputGroup>
                        <Input label="Nome" placeholder="Nome da transação..." {...register('title')}
                        />
                        {errors.title && (
                                <ErrorMessage>{errors.title.message}</ErrorMessage> 
                        )}

                        <InputGroup>
                            <label>Valor</label>
                            <CurrencyInput
                                placeholder='R$ 0,00'
                                format="currency"
                                currency="BRL" 
                                {...register('amount')}
                                />
                                {errors.amount && (
                                <ErrorMessage>{errors.amount.message}</ErrorMessage>
                            )}
                        </InputGroup>
                        <InputMask
                            component={Input}
                            mask="dd/mm/aaaa"
                            replacement={{ d: /\d/, m: /\d/, a: /\d/ }}
                            label="Data"
                            variant="black"
                            placeholder="dd/mm/aaaa" 
                            {...register('date')}
                            />
                            {errors.date && (
                                <ErrorMessage>{errors.date.message}</ErrorMessage>
                            )}

                        <RadioForm>
                            <RadioGroup>
                                <input type="radio" id="income" value="income"{...register('type')} />
                                <label htmlFor="income">Receita</label>
                            </RadioGroup>
                            <RadioGroup>
                                <input type="radio" id="expense" value="expense" {...register('type')} />
                                <label htmlFor="expense">Gasto</label>
                            </RadioGroup>
                            {errors.type && (
                                <ErrorMessage>{errors.type.message}</ErrorMessage>
                            )}
                        </RadioForm>
                    </Content>

                    <footer>
                        <Button onClick={handleClose} variant="outline" type="button">Cancelar</Button>
                        <Button type="submit">Cadastrar</Button>
                    </footer>
                </form>
            </Container>
        </Dialog>

    )
}