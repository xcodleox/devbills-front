import { useCallback, useState } from "react";
import { Dialog } from "../dialog";
import { Button } from "../button";
import { Title } from "../title";
import { Input } from "../input";
import { Container } from "./styles";
import { CreateCategoryData } from "../../validators/types";
import { theme } from "../../styles/theme";
import {createCategorySchema} from '../../validators/schemas'
import {zodResolver} from '@hookform/resolvers/zod'
import { useForm} from "react-hook-form";
import { useFetchAPI } from "../../hooks/useFetchAPI";
import { ErrorMessage } from "../create-transaction-dialog/styles";


export function CreateCategoryDialog() {
const {createCategory, fetchCategories} = useFetchAPI()

    const [open, setOpen] = useState(false);
    const {register, handleSubmit, formState: {errors},} = useForm<CreateCategoryData>({
        defaultValues: {
            title: '',
            color: theme.colors.primary,
        },
        resolver: zodResolver(createCategorySchema)
    })


    const handleClose = useCallback(() =>{
        setOpen(false);
    }, [])

    const onSubmit = useCallback(async(data: CreateCategoryData) =>{
        await createCategory(data)
        handleClose();
        await fetchCategories()
    }, 
        [handleClose, createCategory, fetchCategories])



    return (

        <Dialog open={open}
            onOpenChange={setOpen}
            trigger={<Button>Nova Categoria</Button>}>
            <Container>
                <Title title="Nova Categoria" subtitle="Crie uma nova categoria para suas transações" />

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <Input label="Nome" placeholder="Nome da categoria..."
                        {...register('title')}
                        />
                        {errors.title && (
                                <ErrorMessage>{errors.title.message}</ErrorMessage> 
                        )}
                        <Input label="Cor" type="color" 
                        {...register('color')}
                        />
                        {errors.color && (
                                <ErrorMessage>{errors.color.message}</ErrorMessage> 
                        )}
                    </div>


                    <footer>
                        <Button onClick={handleClose} variant="outline" type="button">Cancelar</Button>
                        <Button type="submit">Cadastrar</Button>
                    </footer>
                </form>
            </Container>
        </Dialog>

    )
}