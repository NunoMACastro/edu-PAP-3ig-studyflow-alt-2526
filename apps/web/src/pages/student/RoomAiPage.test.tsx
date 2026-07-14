/**
 * Testa exclusão mútua e feedback dos comandos IA da sala.
 */
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({
    askRoomAi: vi.fn(),
    listMyRoomAiHistory: vi.fn(),
    listSharedRoomAiAnswers: vi.fn(),
    shareRoomAiAnswer: vi.fn(),
}));

vi.mock("../../lib/apiClient.js", async (importOriginal) => ({
    ...(await importOriginal<typeof import("../../lib/apiClient.js")>()),
    ...api,
}));

import { RoomAiPage } from "./RoomAiPage.js";

beforeEach(() => {
    for (const mock of Object.values(api)) mock.mockReset();
    api.listMyRoomAiHistory.mockResolvedValue([]);
    api.listSharedRoomAiAnswers.mockResolvedValue([]);
    api.shareRoomAiAnswer.mockResolvedValue({});
});

describe("RoomAiPage", () => {
    it("impede perguntas duplicadas e só limpa o draft depois da resposta", async () => {
        const user = userEvent.setup();
        const request = deferred<{
            _id: string;
            roomId: string;
            question: string;
            answer: string;
            sources: { shareId: string; title: string; contentText: string }[];
        }>();
        api.askRoomAi.mockReturnValue(request.promise);
        render(<RoomAiPage roomId="room-1" />);
        await waitFor(() => expect(api.listMyRoomAiHistory).toHaveBeenCalledTimes(1));

        const question = screen.getByLabelText("Pergunta para a IA da sala");
        await user.type(question, "Explica energia");
        await user.click(screen.getByRole("button", { name: "Perguntar" }));

        const pendingButton = screen.getByRole("button", { name: "A perguntar..." });
        expect((pendingButton as HTMLButtonElement).disabled).toBe(true);
        pendingButton.click();
        expect(api.askRoomAi).toHaveBeenCalledTimes(1);
        expect(question).toHaveProperty("value", "Explica energia");

        await act(async () => {
            request.resolve({
                _id: "answer-1",
                roomId: "room-1",
                question: "Explica energia",
                answer: "Energia é capacidade de realizar trabalho.",
                sources: [
                    {
                        shareId: "share-1",
                        title: "Apontamentos",
                        contentText: "Energia",
                    },
                ],
            });
            await request.promise;
        });

        expect(
            await screen.findByText("Energia é capacidade de realizar trabalho."),
        ).toBeTruthy();
        expect(question).toHaveProperty("value", "");
        await waitFor(() => expect(api.listMyRoomAiHistory).toHaveBeenCalledTimes(2));
    });

    it("serializa a partilha e mantém a mensagem de sucesso", async () => {
        const user = userEvent.setup();
        api.askRoomAi.mockResolvedValue({
            _id: "answer-1",
            roomId: "room-1",
            question: "Explica energia",
            answer: "Resposta partilhável",
            sources: [],
        });
        const shareRequest = deferred<Record<string, never>>();
        api.shareRoomAiAnswer.mockReturnValue(shareRequest.promise);
        render(<RoomAiPage roomId="room-1" />);

        await user.type(
            screen.getByLabelText("Pergunta para a IA da sala"),
            "Explica energia",
        );
        await user.click(screen.getByRole("button", { name: "Perguntar" }));
        await screen.findByText("Resposta partilhável");
        await user.click(screen.getByRole("button", { name: "Partilhar read-only" }));

        const pendingButton = screen.getByRole("button", { name: "A partilhar..." });
        expect((pendingButton as HTMLButtonElement).disabled).toBe(true);
        pendingButton.click();
        expect(api.shareRoomAiAnswer).toHaveBeenCalledTimes(1);

        await act(async () => {
            shareRequest.resolve({});
            await shareRequest.promise;
        });
        expect(
            await screen.findByText("Resposta partilhada em modo read-only."),
        ).toBeTruthy();
    });
});

/** Cria uma Promise controlável para validar o estado pendente sem sleeps. */
function deferred<T>() {
    let resolve!: (value: T) => void;
    const promise = new Promise<T>((next) => {
        resolve = next;
    });
    return { promise, resolve };
}
