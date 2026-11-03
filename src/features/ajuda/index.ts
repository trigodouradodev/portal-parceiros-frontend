/**
 * Endereços dos manuais de ajuda, abertos pelo ícone "?" do topo. Os dois
 * exigem login (rotas protegidas).
 *
 * Este índice exporta só constantes de propósito: as páginas (e as imagens do
 * manual) são carregadas sob demanda pelas rotas (`lazy`), então não podem ser
 * importadas estaticamente por quem só precisa da URL.
 */
export const PRIMEIROS_PASSOS_URL = "/ajuda/primeiros-passos";

/** Manual de Originação, aberto pelo ícone de ajuda na tela de Originação. */
export const ORIGINACAO_MANUAL_URL = "/ajuda/originacao";

/** Endereço antigo do Primeiros Passos (arquivo estático público): redireciona. */
export const PRIMEIROS_PASSOS_LEGACY_URL = "/ajuda/primeiros-passos.html";
