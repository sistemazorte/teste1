<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDriverRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->cpf) {
            $digits = preg_replace('/\D/', '', $this->cpf);

            if (strlen($digits) === 11) {
                $this->merge([
                    'cpf' => preg_replace('/(\d{3})(\d{3})(\d{3})(\d{2})/', '$1.$2.$3-$4', $digits),
                ]);
            }
        }

        if ($this->phone) {
            $this->merge([
                'phone' => preg_replace('/\D/', '', $this->phone),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:3', 'max:150'],
            'cpf' => ['required', 'regex:/^\d{3}\.\d{3}\.\d{3}\-\d{2}$/', 'unique:drivers,cpf'],
            'cnh_category' => ['required', Rule::in(['C', 'D', 'E'])],
            'phone' => ['nullable', 'digits_between:10,15'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'O nome é obrigatório.',
            'name.min' => 'O nome deve ter pelo menos 3 caracteres.',
            'cpf.required' => 'O CPF é obrigatório.',
            'cpf.regex' => 'O CPF deve estar no formato 000.000.000-00.',
            'cpf.unique' => 'Este CPF já está cadastrado.',
            'cnh_category.required' => 'A categoria da CNH é obrigatória.',
            'cnh_category.in' => 'A categoria da CNH deve ser C, D ou E.',
            'phone.digits_between' => 'O telefone deve ter entre 10 e 15 dígitos.',
        ];
    }
}